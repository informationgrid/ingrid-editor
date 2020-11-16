package de.ingrid.igeserver.persistence.orientdb

import com.orientechnologies.orient.core.db.ODatabasePool
import com.orientechnologies.orient.core.db.ODatabaseType
import com.orientechnologies.orient.core.db.OrientDB
import com.orientechnologies.orient.core.db.OrientDBConfig
import com.orientechnologies.orient.core.record.ORecord
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe

class TransactionTest : FunSpec() {

    private lateinit var pool: ODatabasePool

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        pool = ODatabasePool(db, "test", "admin", "admin")
        pool.acquire().use { session -> session.newInstance<Any>("Person") }
    }

    init {
        test("a document created outside of a transaction should be visible to other sessions")
        {
            val pool = pool
            pool.acquire().use { session ->
                val element = session.newElement("Person")
                element.setProperty("name", "John")
                element.save<ORecord>()
            }

            pool.acquire().use { session ->
                val persons = session.browseClass("Person")
                val person = persons.next()

                session.countClass("Person") shouldBe 1
                person.field<String>("name") shouldBe "John"
            }
        }

        test("a document created inside of a transaction should not be visible to other sessions if there is no commit")
        {
            val pool = pool
            pool.acquire().use { session ->
                // begin transaction
                session.begin()
                val element = session.newElement("Person")
                element.setProperty("name", "John")
                element.save<ORecord>()
            }

            pool.acquire().use { session ->
                session.countClass("Person") shouldBe 0
            }
        }

        test("a document created inside of a transaction should be visible to other sessions after commit")
        {
            val pool = pool
            pool.acquire().use { session ->
                // begin transaction
                session.begin()
                val element = session.newElement("Person")
                element.setProperty("name", "John")
                element.save<ORecord>()
                session.commit()
            }

            pool.acquire().use { session ->
                session.countClass("Person") shouldBe 1
            }
        }

        test("a document created in another thread should be eventually visible in the first thread")
        {
            val pool = pool
            var otherThread: Thread
            otherThread = pool.acquire().use { session ->
                // begin transaction
                session.begin()
                val element = session.newElement("Person")
                element.setProperty("name", "John")
                element.save<ORecord>()

                // create a document in another thread
                otherThread = Thread(Runnable {
                    pool.acquire().use { session2 ->
                        val element2 = session.newElement("Person")
                        element2.setProperty("name", "Mike")
                        element2.save<ORecord>()
                        // commit transaction in other thread
                        session2.commit()
                    }
                })
                otherThread.start()

                // commit first transaction
                session.commit()
                otherThread
            }

            // wait for other thread to be finished
            otherThread.join()
            pool.acquire().use { session ->
                session.countClass("Person") shouldBe 2
            }
        }
    }
}