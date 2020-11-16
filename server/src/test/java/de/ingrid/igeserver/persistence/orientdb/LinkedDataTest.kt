package de.ingrid.igeserver.persistence.orientdb

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.db.*
import com.orientechnologies.orient.core.metadata.schema.OType
import com.orientechnologies.orient.core.record.impl.ODocument
import de.ingrid.igeserver.persistence.orientdb.OrientDBDatabase
import de.ingrid.igeserver.persistence.orientdb.model.document.OAddressType
import de.ingrid.igeserver.persistence.orientdb.model.document.ODocumentType
import io.kotest.core.spec.style.FunSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import java.util.*

class LinkedDataTest : FunSpec() {

    private val DOCUMENT_CLASS = ODocumentType().className
    private val ADDRESS_CLASS = OAddressType().className

    private val dbService = OrientDBDatabase()
    private lateinit var testDB: ODatabaseSession

    override fun beforeTest(testCase: TestCase) {
        val db = OrientDB("memory:test", OrientDBConfig.defaultConfig())
        db.create("test", ODatabaseType.MEMORY)
        testDB = db.open("test", "admin", "admin")
        testDB.metadata.schema.createClass(DOCUMENT_CLASS)
        testDB.metadata.schema.createClass(ADDRESS_CLASS)
        for (doc in testDB.browseClass(DOCUMENT_CLASS)) {
            testDB.delete(doc)
        }
        for (address in testDB.browseClass(ADDRESS_CLASS)) {
            testDB.delete(address)
        }
        testDB.commit()
    }

    init {
        dbService.entityTypes = listOf(ODocumentType(), OAddressType())

        test("create link as value")
        {
            // create document with linked address
            val address = ODocument(ADDRESS_CLASS)
            address.field("name", "André")
            address.field("city", "Frankfurt")
            val dbAddress = address.save()
            val doc = ODocument(DOCUMENT_CLASS)
            doc.field("title", "Dokument 1")
            doc.field("address", dbAddress)
            doc.save()
            testDB.commit()

            val json = testDB.browseClass(DOCUMENT_CLASS).next().toJSON("fetchPlan:*:-1")
            json shouldBe "{\"address\":{\"city\":\"Frankfurt\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}"
        }

        test("update content of link as value")
        {
            // create document with linked address
            val address = ODocument(ADDRESS_CLASS)
            address.field("name", "André")
            address.field("city", "Frankfurt")
            val dbAddress = address.save()
            val doc = ODocument(DOCUMENT_CLASS)
            doc.field("title", "Dokument 1")
            doc.field("address", dbAddress)
            doc.save()
            testDB.commit()

            // update linked address
            val query = testDB.query("SELECT * FROM $DOCUMENT_CLASS WHERE title='Dokument 1'").next().record
            query.isPresent shouldBe true
            val docFromDb = query.get() as ODocument

            // TODO using DBApi does not update the linked content
            //val map = docFromDb.toMap()
            //map["address.city"] = "Berlin"
            //dbService.save(DocumentType::class, null, "{\"address\": { \"city\": \"Berlin\"}}", null)

            docFromDb.field("address.city", "Berlin");
            docFromDb.save();
            testDB.commit()

            val json = testDB.browseClass(DOCUMENT_CLASS).next().toJSON("fetchPlan:*:-1")
            json shouldBe "{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}"
            testDB.countClass(DOCUMENT_CLASS) shouldBe 1
            testDB.countClass(ADDRESS_CLASS) shouldBe 1
        }

        test("update content of link as value (duplicate?)")
        {
            // create document with linked address
            val address = ODocument(ADDRESS_CLASS)
            address.field("name", "André")
            address.field("city", "Frankfurt")
            val dbAddress = address.save()
            val doc = ODocument(DOCUMENT_CLASS)
            doc.field("title", "Dokument 1")
            doc.field("address", dbAddress)
            doc.save()
            testDB.commit()

            // update linked address
            val query = testDB.query("SELECT * FROM $DOCUMENT_CLASS WHERE title='Dokument 1'").next().record
            query.isPresent shouldBe true
            val docFromDb = query.get() as ODocument

            // TODO what is the difference to preceding test?
            //val map = docFromDb.toMap();
            //map.put("address.city", "Berlin");
            docFromDb.field("address.city", "Berlin")
            docFromDb.save()
            testDB.commit()

            val json = testDB.browseClass(DOCUMENT_CLASS).next().toJSON("fetchPlan:*:-1")
            json shouldBe "{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}"
            testDB.countClass(DOCUMENT_CLASS) shouldBe 1
            testDB.countClass(ADDRESS_CLASS) shouldBe 1
        }

        test("update content of link as value by changing @rid?").config(enabled = false)
        {
            // TODO fix test, what is the intention of the test?

            // create document with linked address and extra address
            val address = ODocument(ADDRESS_CLASS)
            address.field("name", "André")
            address.field("city", "Frankfurt")
            val dbAddress = address.save()
            val address2 = ODocument(ADDRESS_CLASS)
            address2.field("name", "Peter")
            address2.field("city", "München")
            val dbAddress2 = address2.save()
            val doc = ODocument(DOCUMENT_CLASS)
            doc.field("title", "Dokument 1")
            doc.field("description", "Beschreibung des Dokuments")
            doc.field("address", dbAddress)
            val dbDoc = doc.save()
            testDB.commit()

            // link second address with document
            val json = dbDoc.toJSON("rid,version,fetchPlan:*:-1")
            val map = dbDoc.toMap()
            val updatedDoc = ODocument()
            val modJson = "{\"@rid\":\"#17:0\",\"@version\":1,\"address\":{\"@rid\":\"#21:0\",\"@version\":1},\"title\":\"Dokument 1\"}"
            updatedDoc.fromJSON(modJson)
            // updatedDoc.save();
            val dbMergedDOCUMENT_CLASS = dbDoc.merge(updatedDoc, true, true)
            testDB.commit()

            val jsonAfter = testDB.browseClass(DOCUMENT_CLASS).next().toJSON("fetchPlan:*:-1")
            jsonAfter shouldBe "{\"address\":{\"city\":\"Berlin\",\"name\":\"Andr\\u00e9\"},\"title\":\"Dokument 1\"}"
            testDB.countClass(DOCUMENT_CLASS) shouldBe 1
            testDB.countClass(ADDRESS_CLASS) shouldBe 1
        }

        test("create link as OType.LINK")
        {
            // setup relation
            val addressClass = testDB.getClass(ADDRESS_CLASS)
            val documentClass = testDB.getClass(DOCUMENT_CLASS)
            documentClass.createProperty("address", OType.LINK, addressClass)

            // create document with linked address and extra address
            val address = ODocument(ADDRESS_CLASS)
            address.field("city", "Frankfurt")
            address.field("country", "Germany")
            val dbAddress1 = address.save()
            val address2 = ODocument(ADDRESS_CLASS)
            address2.field("city", "Paris")
            address2.field("country", "France")
            val dbAddress2 = address2.save()
            val doc = ODocument(DOCUMENT_CLASS)
            doc.field("title", "Name des Dokuments")
            doc.field("description", "Beschreibung")
            doc.field("address", dbAddress1.identity)
            val dbDoc1 = doc.save()
            testDB.commit()

            val dbDoc = testDB.browseClass(DOCUMENT_CLASS).next()
            dbDoc.toJSON("rid,fetchPlan:*:-1") shouldBe "{\"@rid\":\"${dbDoc1.identity}\",\"address\":{\"@rid\":\"${dbAddress1.identity}\",\"country\":\"Germany\",\"city\":\"Frankfurt\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}"

            // link to second address (set field)
            //dbDoc.field("address", dbAddress2.getIdentity());
            dbDoc.field("address", "34:0")
            //var map = mutableMapOf<String, String>();
            //map["@rid"] = "#34:0";
            //dbDoc.field("address", map);
            dbDoc.toJSON("rid,fetchPlan:*:-1") shouldBe "{\"@rid\":\"${dbDoc1.identity}\",\"address\":{\"@rid\":\"${dbAddress2.identity}\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Name des Dokuments\"}"

            // link to second address (from json)
            val inputJson = "{\"@rid\":\"${dbDoc1.identity}\",\"address\":{\"@rid\":\"${dbAddress2.identity}\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}"
            val docFromJson = ODocument(DOCUMENT_CLASS)
            docFromJson.fromJSON(inputJson)
            docFromJson.toJSON("rid,fetchPlan:*:-1") shouldBe "{\"@rid\":\"${dbDoc1.identity}\",\"address\":{\"@rid\":\"${dbAddress2.identity}\",\"country\":\"France\",\"city\":\"Paris\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}"
        }

        test("tbd real")
        {
            // ========================================
            // DOCUMENT TYPE CLASS
            // ========================================

            // definition created from document type docType
            // {
            //   "geoservice": {
            //     "dbClass": "DOC_GEOSERVICE",
            //     "links": ["address"]
            //   },
            //   "address": {
            //     "dbClass": "MyAddress"
            //   }
            // }
            val typeMapper = HashMap<String, Any>()
            val geoServiceTypeInfo = HashMap<String, Any>()
            geoServiceTypeInfo["dbClass"] = "DOC_GEOSERVICE"
            geoServiceTypeInfo["links"] = arrayOf("address")
            typeMapper["geoservice"] = geoServiceTypeInfo
            val addressTypeInfo = HashMap<String, Any>()
            addressTypeInfo["dbClass"] = "MyAddress"
            typeMapper["address"] = addressTypeInfo

            // creation of necessary db classes with properties (links)
            for (docType in typeMapper.keys) {
                val profile = typeMapper[docType] as HashMap<*, *>?
                val documentClass = testDB.createClass(profile!!["dbClass"] as String?)
                val links = profile["links"] as Array<String>?
                if (links != null) {
                    for (link in links) {
                        documentClass.createProperty(link, OType.LINK)
                    }
                }
            }

            // ========================================
            // JUST SOME DEMO DATA
            // ========================================

            // set initial db data
            val address = ODocument("MyAddress")
            address.field("city", "Frankfurt")
            address.field("country", "Germany")
            val dbAddress1 = address.save()
            val address2 = ODocument("MyAddress")
            address2.field("city", "Paris")
            address2.field("country", "France")
            val dbAddress2 = address2.save()
            val doc = ODocument("DOC_GEOSERVICE")
            doc.field("title", "Name des Dokuments")
            doc.field("description", "Beschreibung")
            doc.field("address", dbAddress1.identity)
            val dbDoc1 = doc.save()

            // ========================================
            // CONTROLLER CLASS
            // ========================================

            // incoming test json from frontend
            //language=JSON
            val inputJson = "{\"@rid\":\"${dbDoc1.identity}\",\"_type\":\"geoservice\",\"address\":{\"@rid\":\"${dbAddress2.identity}\", \"city\":\"Paris\",\"country\":\"New France\"},\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}"

            // convert json to Node object
            val node = ObjectMapper().readTree(inputJson) as ObjectNode

            // get document type from json node
            val docType = node["_type"].asText()
            val profileInfo = typeMapper[docType] as HashMap<String, Any>?

            // transform incoming document to replace nested documents with reference ID
            val links = profileInfo!!["links"] as Array<String>?
            for (link in links!!) {
                // set link reference into field directly
                node.put(link, node[link]["@rid"].textValue())
            }

            // create new db document object with defined class from document type
            val dbClass = profileInfo["dbClass"] as String?

            // ========================================
            // DATABASE CLASS
            // ========================================
            val docFromJson = ODocument(dbClass)
            docFromJson.fromJSON(node.toString())
            docFromJson.toJSON("rid,fetchPlan:*:-1") shouldBe "{\"@rid\":\"${dbDoc1.identity}\",\"address\":{\"@rid\":\"${dbAddress2.identity}\",\"country\":\"France\",\"city\":\"Paris\"},\"_type\":\"geoservice\",\"description\":\"Beschreibung\",\"title\":\"Neuer Name des Dokuments\"}"
            testDB.countClass("MyAddress") shouldBe 2
            testDB.countClass("DOC_GEOSERVICE") shouldBe 1
        }
    }
}