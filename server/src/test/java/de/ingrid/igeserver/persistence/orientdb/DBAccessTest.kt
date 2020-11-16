package de.ingrid.igeserver.persistence.orientdb

import com.orientechnologies.orient.core.db.*
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.types.shouldBeSameInstanceAs
import io.kotest.matchers.types.shouldNotBeSameInstanceAs
import java.util.concurrent.CompletableFuture

class DBAccessTest : FunSpec() {

    private lateinit var pool: ODatabasePool

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        pool = ODatabasePool(db, "test", "admin", "admin")
    }

    init {
        test("acquire from pool should create a new session instance and newly assign the thread local instance")
        {
            val session1 = pool.acquire()
            val internal = ODatabaseRecordThreadLocal.instance().get()
            session1 shouldBeSameInstanceAs internal

            val session2 = pool.acquire()
            val internalAfter = ODatabaseRecordThreadLocal.instance().get()
            session2 shouldBeSameInstanceAs internalAfter

            session2 shouldNotBeSameInstanceAs session1
            internalAfter shouldNotBeSameInstanceAs internal

            pool.close()
        }

        test("acquire from pool should return the same session instance after the last acquired session instance was closed")
        {
            val session1 = pool.acquire()
            session1.close()

            val session2 = pool.acquire()
            session2 shouldBeSameInstanceAs session1

            pool.close()
        }

        test("acquire from pool in different threads should create different session instances")
        {
            val sessionHash1 = CompletableFuture<Int>()
            val t1 = Thread(Runnable {
                pool.acquire().use {
                    sessionHash1.complete(ODatabaseRecordThreadLocal.instance().get().hashCode())
                }
            })
            t1.start()

            val sessionHash2 = CompletableFuture<Int>()
            val t2 = Thread(Runnable {
                pool.acquire().use {
                    sessionHash2.complete(ODatabaseRecordThreadLocal.instance().get().hashCode())
                }
            })
            t2.start()

            t1.join()
            t2.join()

            sessionHash2.get() shouldNotBe sessionHash1.get()

            pool.close()
        }
    }
}