package de.ingrid.igeserver.persistence

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import com.orientechnologies.orient.core.exception.OConcurrentModificationException
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDatabase
import de.ingrid.igeserver.persistence.orientdb.model.meta.OUserInfoType
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.beInstanceOf
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import java.util.concurrent.CompletableFuture

class ConcurrencyTest : FunSpec() {

    private lateinit var pool: ODatabasePool

    private val dbService = OrientDBDatabase()

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        pool = ODatabasePool(db, "test", "admin", "admin")
        pool.acquire().use { session -> session.newInstance<Any>(OUserInfoType().className) }
    }

    init {
        dbService.entityTypes = listOf(OUserInfoType())

        test("documents created in different threads should be stored correctly in the database")
        {
            val numThreads = 1000
            var threads = mutableListOf<Thread>()
            for (x in 1..numThreads) {
                val t = Thread(Runnable {
                    pool.acquire().use {
                        Thread.sleep(((Math.random() * 5000).toLong()));
                        val person = "{\"name\": \"${x.toString().padStart(4, '0')}\"}"
                        dbService.save(UserInfoType::class, null, person)
                    }
                })
                t.start()
                threads.add(t)
            }
            threads.forEach { t -> t.join() }

            var users = mutableListOf<JsonNode>()
            pool.acquire().use {
                users.addAll(dbService.findAll(UserInfoType::class)!!)
            }
            users.size shouldBe numThreads
            users.distinctBy { u -> u["name"] }.size shouldBe numThreads
            users.sortedBy { u -> u["name"].asText() }[0]["name"].asText() shouldBe "1".padStart(4, '0')
            users.sortedByDescending { u -> u["name"].asText() }[0]["name"].asText() shouldBe "$numThreads".padStart(4, '0')

            pool.close()
        }

        test("updating a document that was changed in another thread should result in a version conflict")
        {
            // first thread
            val exceptionThrown = CompletableFuture<Exception?>()
            val t1 = Thread(Runnable {
                pool.acquire().use {session ->
                    // create the document and commit
                    println("1. create")
                    dbService.save(UserInfoType::class, null, "{\"name\": \"UserA\"}")
                    session.commit()

                    // load the document
                    println("1. load & check")
                    session.begin()
                    var person = dbService.findAll(UserInfoType::class)!![0]
                    person["name"].asText() shouldBe "UserA"
                    person["@version"].asInt() shouldBe 1

                    // wait until the second thread updated the document
                    Thread.sleep(5000);

                    // try to update the document based on the expired state
                    println("1. update")
                    var exception: Exception? = null
                    try {
                        (person as ObjectNode).put("name", "UserC")
                        dbService.save(UserInfoType::class, person["@rid"].asText(), person.toString())
                        session.commit()
                    }
                    catch (ex: OConcurrentModificationException) {
                        exception = ex
                    }
                    finally {
                        exceptionThrown.complete(exception)
                    }

                }
            })

            // second thread
            val t2 = Thread(Runnable {
                pool.acquire().use {session ->
                    // update the document while it is loaded in the first thread's session
                    Thread.sleep(1000);
                    println("2. load")
                    var person = dbService.findAll(UserInfoType::class)!![0]
                    person["name"].asText() shouldBe "UserA"
                    person["@version"].asInt() shouldBe 1

                    println("2. update")
                    (person as ObjectNode).put("name", "UserB")
                    dbService.save(UserInfoType::class, person["@rid"].asText(), person.toString())
                    session.commit()

                    println("2. check")
                    var personUpdated = dbService.findAll(UserInfoType::class)!![0]
                    personUpdated["name"].asText() shouldBe "UserB"
                    personUpdated["@version"].asInt() shouldBe 2
                }
            })

            t1.start()
            t2.start()

            t1.join()
            t2.join()

            exceptionThrown.get() should beInstanceOf<OConcurrentModificationException>()
            pool.acquire().use {
                var person = dbService.findAll(UserInfoType::class)!![0]
                person["name"].asText() shouldBe "UserB"
                person["@version"].asInt() shouldBe 2
            }

            pool.close()
        }
    }
}