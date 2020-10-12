package de.ingrid.igeserver.persistence.orientdb

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.orientdb.model.meta.OUserInfoType
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.types.beInstanceOf
import kotlinx.coroutines.asCoroutineDispatcher
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext
import java.util.concurrent.CompletableFuture
import java.util.concurrent.Executors

class ConcurrencyTest : FunSpec() {

    private val dbService = OrientDBDatabase()

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        db.open("test", "admin", "admin").use { session ->
            session.newInstance<Any>(OUserInfoType().className)
        }
        dbService.orientDB = db
    }

    init {
        dbService.entityTypes = listOf(OUserInfoType())

        test("documents created in different threads should be stored correctly in the database")
        {
            val numThreads = 1000
            var threads = mutableListOf<Thread>()
            for (x in 1..numThreads) {
                val t = Thread(Runnable {
                    dbService.acquire("test").use {
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
            dbService.acquire("test").use {
                users.addAll(dbService.findAll(UserInfoType::class)!!)
            }
            users.size shouldBe numThreads
            users.distinctBy { u -> u["name"] }.size shouldBe numThreads
            users.sortedBy { u -> u["name"].asText() }[0]["name"].asText() shouldBe "1".padStart(4, '0')
            users.sortedByDescending { u -> u["name"].asText() }[0]["name"].asText() shouldBe "$numThreads".padStart(4, '0')
        }

        test("updating a document that was changed in another thread should result in a version conflict")
        {
            val exceptionThrown = CompletableFuture<Exception?>()
            Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { ctx1 ->
                Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { ctx2 ->
                    runBlocking(ctx1) {
                        dbService.acquire("test").use {
                            // create the document and commit
                            dbService.beginTransaction()
                            dbService.save(UserInfoType::class, null, "{\"name\": \"UserA\"}")
                            dbService.commitTransaction()

                            // load the document
                            dbService.beginTransaction()
                            var personCtx1 = dbService.findAll(UserInfoType::class)!![0]
                            personCtx1["name"].asText() shouldBe "UserA"
                            personCtx1["@version"].asInt() shouldBe 1

                            // wait until the second thread updated the document
                            withContext(ctx2) {
                                dbService.acquire("test").use {
                                    // update the document while it is loaded in the first thread's session
                                    dbService.beginTransaction()
                                    var personCtx2 = dbService.findAll(UserInfoType::class)!![0]
                                    personCtx2["name"].asText() shouldBe "UserA"
                                    personCtx2["@version"].asInt() shouldBe 1

                                    (personCtx2 as ObjectNode).put("name", "UserB")
                                    dbService.save(UserInfoType::class, personCtx2["@rid"].asText(), personCtx2.toString())
                                    dbService.commitTransaction()

                                    // check if the document changed
                                    var personUpdated = dbService.findAll(UserInfoType::class)!![0]
                                    personUpdated["name"].asText() shouldBe "UserB"
                                    personUpdated["@version"].asInt() shouldBe 2
                                }
                            }

                            // try to update the document based on the expired state in the started transaction
                            var exception: Exception? = null
                            try {
                                (personCtx1 as ObjectNode).put("name", "UserC")
                                dbService.save(UserInfoType::class, personCtx1["@rid"].asText(), personCtx1.toString())
                                dbService.commitTransaction()
                            } catch (ex: ConcurrentModificationException) {
                                exception = ex
                            } finally {
                                exceptionThrown.complete(exception)
                            }
                        }
                    }
                }
            }

            val ex = exceptionThrown.get()
            ex should beInstanceOf<ConcurrentModificationException>()
            (ex as ConcurrentModificationException).data?.get("recordVersion") shouldBe 1
            ex.data?.get("databaseVersion") shouldBe 2
            dbService.acquire("test").use {
                var person = dbService.findAll(UserInfoType::class)!![0]
                person["name"].asText() shouldBe "UserB"
                person["@version"].asInt() shouldBe 2
            }
        }
    }
}