package de.ingrid.igeserver.db

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import com.orientechnologies.orient.core.id.ORecordId
import com.orientechnologies.orient.core.metadata.schema.OType
import com.orientechnologies.orient.core.record.ORecord
import de.ingrid.igeserver.db.impl.OrientDBDatabase
import de.ingrid.igeserver.model.QueryField
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import java.util.*

class OrientDBDatabaseTest : FunSpec() {

    private lateinit var pool: ODatabasePool

    private val dbService = OrientDBDatabase()

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        pool = ODatabasePool(db, "test", "admin", "admin")
        pool.acquire().use { session -> session.newInstance<Any>("User") }
    }

    private fun addTestData() {
        pool.acquire().use {
            val person1Map = "{ \"name\": \"John\", \"age\": \"35\"}"
            dbService.save("User", null, person1Map)
            val person2Map = "{ \"name\": \"Mike\", \"age\": \"48\"}"
            dbService.save("User", null, person2Map)
        }
    }

    init {
        test("a document created inside a transaction should be visible to other sessions only after commit")
        {
            pool.acquire().use { session ->
                // start transaction in first session
                session.begin()

                // create new person in first session
                val person1 = session.newElement("User")
                person1.setProperty("name", "John")
                person1.setProperty("age", "35")
                session.save<ORecord>(person1)

                // new person is not yet visible outside of the session
                val session2 = pool.acquire()
                session2.countClass("User") shouldBe 0
                dbService.findAll(DBApi.DBClass.User.name)?.size shouldBe 0
                session2.close()

                // commit transaction in first session
                ODatabaseRecordThreadLocal.instance().set(session as ODatabaseDocumentInternal)
                session.commit()

                // new person is visible outside of the session
                val session3 = pool.acquire()
                dbService.findAll(DBApi.DBClass.User.name)?.size shouldBe 1

                // set correct session to close it correctly
                ODatabaseRecordThreadLocal.instance().set(session)
            }
        }

        test("findAll should find all documents of type")
        {
            addTestData()
            pool.acquire().use {
                dbService.findAll(DBApi.DBClass.User.name)?.size shouldBe 2
            }
        }

        test("findAll with query should find only documents matching the query")
        {
            addTestData()
            pool.acquire().use {
                val query: MutableList<QueryField> = ArrayList()
                query.add(QueryField("age", "48", false))
                val options = FindOptions()
                options.queryType = QueryType.like
                options.resolveReferences = false

                val persons = dbService.findAll("User", query, options)
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
            id = pool.acquire().use {
                val options = FindOptions()
                options.queryType = QueryType.like
                options.resolveReferences = false
                val docToUpdate = dbService.findAll("User", query, options).hits[0]
                id = docToUpdate["@rid"].asText()
                (docToUpdate as ObjectNode).put("name", "Johann");
                val save = dbService.save("User", id, docToUpdate.toString())

                save shouldNotBe null

                // return the id of modified document
                id
            }

            // changes are visible in second session
            pool.acquire().use {
                val options = FindOptions()
                options.queryType = QueryType.like
                options.resolveReferences = false
                val updatedDoc = dbService.findAll("User", query, options).hits[0]

                updatedDoc["name"].asText() shouldBe "Johann"
                updatedDoc["age"].asText() shouldBe "48"
                updatedDoc["@rid"].asText() shouldBe id
            }
        }

        test("save should support creating references")
        {
            pool.acquire().use { session ->

                // create document class with linked list property to address-references
                val docClass = session.createClass(DBApi.DBClass.Documents.name)
                docClass.createProperty("addresses", OType.LINKLIST, docClass)

                // add first document
                val doc1 = "{\"title\": \"my document\"}"
                val doc1Result = dbService.save(DBApi.DBClass.Documents.name, null, doc1)
                doc1Result shouldNotBe null

                // add second document with reference to first document
                val addressReferences: MutableList<ORecordId> = ArrayList()
                addressReferences.add(ORecordId(doc1Result["@rid"].asText()))
                val doc2 = "{\"title\": \"my other document with reference\", \"addresses\": $addressReferences}"
                val doc2Result = dbService.save(DBApi.DBClass.Documents.name, null, doc2)
                doc2Result shouldNotBe null
            }

            pool.acquire().use {
                // check reference in second document
                val docs = dbService.findAll(DBApi.DBClass.Documents.name)

                docs!!.size shouldBe 2
                val refId = (docs[1]!!["addresses"] as ArrayNode)[0].asText()
                val ref = dbService.find(DBApi.DBClass.Documents.name, refId)
                ref!!["title"].asText() shouldBe "my document"
            }
        }
    }
}