package de.ingrid.igeserver.persistence.orientdb

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import com.orientechnologies.orient.core.id.ORecordId
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.orientdb.model.document.ODocumentType
import de.ingrid.igeserver.persistence.orientdb.model.meta.OUserInfoType
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.*
import java.util.*
import java.util.concurrent.Executors

class OrientDBDatabaseTest : FunSpec() {

    private val dbService = OrientDBDatabase()

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        db.open("test", "admin", "admin").use { session ->
            session.newInstance<Any>(OUserInfoType().className)

            // create document class with linked list property to document-references
            val docClass = session.createClass(ODocumentType().className)
            docClass.createProperty("addresses", OType.LINKLIST, docClass)
        }
        dbService.orientDB = db
    }

    private fun addTestData() {
        dbService.acquire("test").use {
            val person1Map = "{ \"name\": \"John\", \"age\": \"35\"}"
            dbService.save(UserInfoType::class, null, person1Map)
            val person2Map = "{ \"name\": \"Mike\", \"age\": \"48\"}"
            dbService.save(UserInfoType::class, null, person2Map)
        }
    }

    init {
        dbService.entityTypes = listOf(OUserInfoType(), ODocumentType())

        test("a document created inside a transaction should be visible to other sessions only after commit")
        {
            Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { ctx1 ->
                Executors.newSingleThreadExecutor().asCoroutineDispatcher().use { ctx2 ->
                    runBlocking(ctx1) {
                        dbService.acquire("test").use {
                            // start transaction in first session
                            dbService.beginTransaction()

                            // create new person in first session
                            dbService.save(UserInfoType::class, null, "{ \"name\": \"Mike\", \"age\": \"48\"}")

                            // new person is not yet visible outside of the session
                            withContext(ctx2) {
                                dbService.acquire("test").use {
                                    dbService.findAll(UserInfoType::class).size shouldBe 0
                                }
                            }

                            // commit transaction in first session
                            dbService.commitTransaction()

                            // new person is visible outside of the session
                            withContext(ctx2) {
                                dbService.acquire("test").use {
                                    dbService.findAll(UserInfoType::class).size shouldBe 1
                                }
                            }
                        }
                    }
                }
            }
        }

        test("findAll should find all documents of type")
        {
            addTestData()
            dbService.acquire("test").use {
                dbService.findAll(UserInfoType::class).size shouldBe 2
            }
        }

        test("findAll with query should find only documents matching the query")
        {
            addTestData()
            dbService.acquire("test").use {
                val query: MutableList<QueryField> = ArrayList()
                query.add(QueryField("age", "48", false))
                val options = FindOptions(
                        queryType = QueryType.LIKE,
                        resolveReferences = false)

                val persons = dbService.findAll(UserInfoType::class, query, options)
                persons.totalHits shouldBe 1
                persons.hits.size shouldBe 1
            }
        }

        test("save should update the document")
        {
            addTestData()

            val query: MutableList<QueryField> = ArrayList()
            query.add(QueryField("age", "48", false))

            // modify document in first session
            var id: String
            id = dbService.acquire("test").use {
                val options = FindOptions(
                        queryType = QueryType.LIKE,
                        resolveReferences = false)
                val docToUpdate = dbService.findAll(UserInfoType::class, query, options).hits[0]
                id = docToUpdate["@rid"].asText()
                (docToUpdate as ObjectNode).put("name", "Johann")
                val save = dbService.save(UserInfoType::class, id, docToUpdate.toString())

                save shouldNotBe null

                // return the id of modified document
                id
            }

            // changes are visible in second session
            dbService.acquire("test").use {
                val options = FindOptions(
                        queryType = QueryType.LIKE,
                        resolveReferences = false)
                val updatedDoc = dbService.findAll(UserInfoType::class, query, options).hits[0]

                updatedDoc["name"].asText() shouldBe "Johann"
                updatedDoc["age"].asText() shouldBe "48"
                updatedDoc["@rid"].asText() shouldBe id
            }
        }

        test("save should support creating references")
        {
            dbService.acquire("test").use {
                // add first document
                val doc1 = "{\"title\": \"my document\"}"
                val doc1Result = dbService.save(DocumentType::class, null, doc1)
                doc1Result shouldNotBe null

                // add second document with reference to first document
                val addressReferences: MutableList<ORecordId> = ArrayList()
                addressReferences.add(ORecordId(doc1Result["@rid"].asText()))
                val doc2 = "{\"title\": \"my other document with reference\", \"addresses\": $addressReferences}"
                val doc2Result = dbService.save(DocumentType::class, null, doc2)
                doc2Result shouldNotBe null
            }

            dbService.acquire("test").use {
                // check reference in second document
                val docs = dbService.findAll(DocumentType::class)

                docs.size shouldBe 2
                val refId = (docs[1]["addresses"] as ArrayNode)[0].asText()
                val ref = dbService.find(DocumentType::class, refId)
                ref!!["title"].asText() shouldBe "my document"
            }
        }
    }
}