package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.repository.BehaviourRepository
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.assertj.core.api.Assertions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import java.time.LocalDateTime
import java.time.Month
import java.time.format.DateTimeFormatter
import java.util.*

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/test_data.sql"], config = SqlConfig(encoding = "UTF-8"))
class PostgreSQLDatabaseTest : AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Autowired
    private lateinit var behaviourRepo: BehaviourRepository

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

    private val DATE_TIME_REGEX = "[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.*"

    @Test
    fun `loading a document`() {
        val id = 1000

        val loadedDoc = dbService.find(DocumentType::class, id.toString())!!

        Assertions.assertThat(loadedDoc["db_id"].intValue()).isEqualTo(id)
        Assertions.assertThat(loadedDoc["db_version"].intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo(id.toString())

        Assertions.assertThat(loadedDoc[FIELD_ID].textValue()).isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc[FIELD_DOCUMENT_TYPE].textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc[FIELD_CREATED].textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc[FIELD_MODIFIED].textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc["title"].textValue()).isEqualTo("Test Document")
        Assertions.assertThat(loadedDoc["firstName"].textValue()).isEqualTo("Petra")
        Assertions.assertThat(loadedDoc["lastName"].textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(loadedDoc["company"].textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(loadedDoc.has("data")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse

        dbService.removeInternalFields(loadedDoc)

        Assertions.assertThat(loadedDoc.has("db_id")).isFalse
        Assertions.assertThat(loadedDoc.has("db_version")).isFalse
        Assertions.assertThat(loadedDoc[FIELD_VERSION].intValue()).isEqualTo(0)
    }

    @Test
    fun `creating a document`() {
        val doc = """
            {
                "_id":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "_type":"AddressDoc",
                "title":"Test Document",
                "firstName":"Petra",
                "lastName":"Mustermann",
                "company":"LWL-Schulverwaltung Münster",
                "_created":"2020-11-03T10:23:10.028062900+01:00",
                "_modified":"2020-11-03T10:23:10.028062900+01:00"
            }
        """

        val oldCount = dbService.findAll(DocumentType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(DocumentType::class, null, doc)
        }

        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isNotNull
        Assertions.assertThat(savedDoc.get("db_version")?.intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isNotNull

        val loadedDoc = dbService.find(DocumentType::class, savedDoc.get("db_id").intValue().toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(loadedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc.get(FIELD_CREATED)?.textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc.get(FIELD_MODIFIED)?.textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc.get("title")?.textValue()).isEqualTo("Test Document")
        Assertions.assertThat(loadedDoc.get("firstName")?.textValue()).isEqualTo("Petra")
        Assertions.assertThat(loadedDoc.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(loadedDoc.get("company")?.textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(loadedDoc.has("data")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse
    }

    @Test
    fun `creating a document wrapper`() {
        val doc = """
            {
                "_id":"bc365545-e4b5-4359-bfb5-84367513752e",
                "_parent":"5d2ff598-45fd-4516-b843-0b1787bd8264",
                "_type":"FOLDER",
                "_category":"data",
                "draft":"1003",
                "published":null,
                "archive":["1004","1005"]
            }
        """

        val oldCount = dbService.findAll(DocumentWrapperType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(DocumentWrapperType::class, null, doc)
        }

        Assertions.assertThat(dbService.findAll(DocumentWrapperType::class).size).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isNotNull
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isNotNull

        val loadedDoc = dbService.find(DocumentWrapperType::class, savedDoc.get("db_id").intValue().toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get(FIELD_ID)?.textValue()).isEqualTo("bc365545-e4b5-4359-bfb5-84367513752e")
        Assertions.assertThat(loadedDoc.get(FIELD_PARENT)?.textValue())
            .isEqualTo("5d2ff598-45fd-4516-b843-0b1787bd8264")
        Assertions.assertThat(loadedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("FOLDER")
        Assertions.assertThat(loadedDoc.get(FIELD_CATEGORY)?.textValue()).isEqualTo("data")
        Assertions.assertThat(loadedDoc.get(FIELD_DRAFT)?.textValue()).isEqualTo("1003")
        Assertions.assertThat(loadedDoc.get(FIELD_PUBLISHED)?.isNull).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE)?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).size()).isEqualTo(2)
        Assertions.assertThat((loadedDoc.get(FIELD_ARCHIVE) as ArrayNode).any { it.textValue() == "1004" }).isTrue
        Assertions.assertThat((loadedDoc.get(FIELD_ARCHIVE) as ArrayNode).any { it.textValue() == "1005" }).isTrue
    }

    @Test
    fun `creating a user`() {
        val doc = """
            {
                "userId":"user2",
                "curCatalog":"test_catalog",
                "catalogIds":["test_catalog","test_catalog_2"],
                "recentLogins":[1603907361961,1603907397517]
            }
        """

        val oldCount = dbService.findAll(UserInfoType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(UserInfoType::class, null, doc)
        }

        Assertions.assertThat(dbService.findAll(UserInfoType::class).size).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isNotNull
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isNotNull

        val loadedDoc = dbService.find(UserInfoType::class, savedDoc.get("db_id").intValue().toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get("userId")?.textValue()).isEqualTo("user2")
        Assertions.assertThat(loadedDoc.get("curCatalog")?.textValue()).isEqualTo("test_catalog")
        Assertions.assertThat(loadedDoc.get("catalogIds")?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get("catalogIds")?.size()).isEqualTo(2)
        Assertions.assertThat((loadedDoc.get("catalogIds") as ArrayNode).any { it.textValue() == "test_catalog" }).isTrue
        Assertions.assertThat((loadedDoc.get("catalogIds") as ArrayNode).any { it.textValue() == "test_catalog_2" }).isTrue
        Assertions.assertThat(loadedDoc.get("recentLogins")?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get("recentLogins")?.size()).isEqualTo(2)
        Assertions.assertThat(loadedDoc.get("recentLogins")?.get(0)?.longValue()).isEqualTo(1603907361961)
        Assertions.assertThat(loadedDoc.get("recentLogins")?.get(1)?.longValue()).isEqualTo(1603907397517)
        Assertions.assertThat(loadedDoc.has("data")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse
    }

    @Test
    fun `creating a behaviour`() {
        val catalogRef = catalogRepo.findByIdentifier("test_catalog")
        
        val doc = Behaviour().apply {
            catalog = catalogRef
            name = "plugin.session.timeout2"
            active = false
            data = mapOf("duration" to 500)
        }

        val oldCount = behaviourRepo.count()

        
        val savedDoc = behaviourRepo.save(doc)

        Assertions.assertThat(behaviourRepo.count()).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.id).isNotNull

        val loadedDoc = behaviourRepo.findByIdOrNull(savedDoc.id)
        Assertions.assertThat(loadedDoc).isNotNull
        Assertions.assertThat(loadedDoc?.name).isEqualTo("plugin.session.timeout2")
        Assertions.assertThat(loadedDoc?.active).isEqualTo(false)
        Assertions.assertThat(loadedDoc?.data?.get("duration")).isEqualTo(500)
    }

    @Test
    fun `updating a document`() {
        val id = 1000
        val doc = """
            {
                "_id":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "_type":"AddressDoc",
                "title":"Test Document Geändert",
                "firstName":"Peter",
                "company":"LWL-Kliniken"
            }
        """

        val oldCount = dbService.findAll(DocumentType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(DocumentType::class, id.toString(), doc)
        }

        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount)

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(savedDoc.get("db_version")?.intValue()).isEqualTo(1)
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isEqualTo(id.toString())

        val loadedDoc = dbService.find(DocumentType::class, id.toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(loadedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc.get(FIELD_CREATED)?.textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc.get(FIELD_MODIFIED)?.textValue()).matches(DATE_TIME_REGEX)
        Assertions.assertThat(loadedDoc.get("title")?.textValue()).isEqualTo("Test Document Geändert")
        Assertions.assertThat(loadedDoc.get("firstName")?.textValue()).isEqualTo("Peter")
        Assertions.assertThat(loadedDoc.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(loadedDoc.get("company")?.textValue()).isEqualTo("LWL-Kliniken")
        Assertions.assertThat(loadedDoc.has("data")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse
    }

    @Test
    fun `updating a not existing document`() {
        val id = 2000
        val doc = """
            {
                "_id":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "_type":"AddressDoc",
                "title":"Test Document Geändert",
                "firstName":"Peter",
                "company":"LWL-Kliniken"
            }
        """

        val oldCount = dbService.findAll(DocumentType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(DocumentType::class, id.toString(), doc)
        }

        // a new document is created
        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.get("db_id")).isNotNull
        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isNotEqualTo(id)
    }

    @Test
    fun `updating a user`() {
        val id = 10
        val userId = "user1"
        val catalogName = "test_catalog_2"

        val savedDoc = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val query = listOf(QueryField("userId", userId))
            val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = false
            )
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            val user = list.hits[0] as ObjectNode

            user.replace("catalogIds", jacksonObjectMapper().createArrayNode().add(catalogName))
            user.put("curCatalog", catalogName)

            val recordId = dbService.getRecordId(user)
            dbService.save(UserInfoType::class, recordId, user.toString())
        }

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isEqualTo(id.toString())

        val loadedDoc = dbService.find(UserInfoType::class, id.toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get("curCatalog")?.textValue()).isEqualTo("test_catalog_2")
        Assertions.assertThat(loadedDoc.get("catalogIds")?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get("catalogIds").size()).isEqualTo(1)
        Assertions.assertThat(loadedDoc.get("catalogIds").get(0).textValue()).isEqualTo("test_catalog_2")
        Assertions.assertThat(loadedDoc.get("recentLogins")?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get("recentLogins").size()).isEqualTo(1)
        Assertions.assertThat(loadedDoc.get("recentLogins").get(0).longValue()).isEqualTo(1604100256021)
    }


    @Test
    fun `updating a document wrapper`() {
        val id = 2002
        val uuid = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            val query = listOf(QueryField(FIELD_ID, uuid))
            val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = false
            )
            val list = dbService.findAll(DocumentWrapperType::class, query, findOptions)
            val wrapper = list.hits[0] as ObjectNode

            wrapper.put(FIELD_DRAFT, "1001")
            wrapper.replace(FIELD_PUBLISHED, null)
            wrapper.replace(FIELD_ARCHIVE, jacksonObjectMapper().createArrayNode().add("1001").add("1002"))

            val recordId = dbService.getRecordId(wrapper)
            dbService.save(DocumentWrapperType::class, recordId, wrapper.toString())
        }

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isEqualTo(id)
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isEqualTo(id.toString())

        val loadedDoc = dbService.find(DocumentWrapperType::class, id.toString())
        Assertions.assertThat(loadedDoc as JsonNode).isNotNull
        Assertions.assertThat(loadedDoc.get(FIELD_DRAFT)?.textValue()).isEqualTo("1001")
        Assertions.assertThat(loadedDoc.get(FIELD_PUBLISHED).isNull).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE)?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).size()).isEqualTo(2)
        Assertions.assertThat((loadedDoc.get(FIELD_ARCHIVE) as ArrayNode).any { it.textValue() == "1001" }).isTrue
        Assertions.assertThat((loadedDoc.get(FIELD_ARCHIVE) as ArrayNode).any { it.textValue() == "1002" }).isTrue
    }

    @Test
    fun `deleting a document`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
        val wrapperId = "2002"

        val oldCount = dbService.findAll(DocumentType::class).size

        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            dbService.remove(DocumentType::class, docId)
        }

        // all instances with the same uuid are deleted
        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount - 3)

        // attached wrapper still exists
        Assertions.assertThat(dbService.find(DocumentWrapperType::class, wrapperId)).isNotNull
    }

    @Test
    fun `deleting a not existing document`() {
        val docId = "84e91e8f-61e1-4d2c-6869-0252adc03fb3"

        val exception = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            shouldThrow<PersistenceException> {
                dbService.remove(DocumentType::class, docId)
            }
        }

        Assertions.assertThat(exception.message).startsWith("Failed to delete non-existing document")
    }

    @Test
    fun `deleting a document wrapper`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        val oldCount = dbService.findAll(DocumentWrapperType::class).size

        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            dbService.remove(DocumentWrapperType::class, docId)
        }

        // all instances with the same uuid are deleted
        Assertions.assertThat(dbService.findAll(DocumentWrapperType::class).size).isEqualTo(oldCount - 1)

        // attached documents are removed
        Assertions.assertThat(dbService.find(DocumentType::class, "1000")).isNull()
        Assertions.assertThat(dbService.find(DocumentType::class, "1001")).isNull()
        Assertions.assertThat(dbService.find(DocumentType::class, "1002")).isNull()
    }

    @Test
    fun `deleting a user`() {
        val userId = "user1"
        val catalogId = "100"

        val oldCount = dbService.findAll(UserInfoType::class).size

        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            dbService.remove(UserInfoType::class, userId)
        }

        Assertions.assertThat(dbService.findAll(UserInfoType::class).size).isEqualTo(oldCount - 1)

        // attached catalog still exists
        Assertions.assertThat(dbService.find(CatalogInfoType::class, catalogId)).isNotNull
    }

    @Test
    fun `getting a record id`() {
        val catalogRecordId = catalogRepo.findByIdentifier("test_catalog").id
        Assertions.assertThat(catalogRecordId).isEqualTo(100)

        val behaviourRecordId = behaviourRepo.findAll().find { it.name == "plugin.address.title"}?.id
        Assertions.assertThat(behaviourRecordId).isEqualTo(202)
    }

    @Test
    fun `counting children`() {
        val count = dbService.countChildren("8f891e4e-161e-4d2c-6869-03f02ab352dc")
        Assertions.assertThat(count).isEqualTo(2)
    }

    @Test
    fun `finding all documents`() {
        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            dbService.findAll(AuditLogRecordType::class)
        }

        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result.size).isEqualTo(3)
    }

    @Test
    fun `finding documents by query, query embedded json by data column name`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
            QueryField("logger", "audit.data-history"),
            QueryField("message.target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
            QueryField("message.actor", "user1"),
            QueryField("message.time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
            QueryField("message.time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
            QueryField("message.data.description", "Test description")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue())
            .isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, query embedded json by data property name`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
            QueryField("logger", "audit.data-history"),
            QueryField("data.target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
            QueryField("data.actor", "user1"),
            QueryField("data.time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
            QueryField("data.time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
            QueryField("data.data.description", "Test description")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue())
            .isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, query embedded json directly (without property name)`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
            QueryField("logger", "audit.data-history"),
            QueryField("target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
            QueryField("actor", "user1"),
            QueryField("time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
            QueryField("time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
            // NOTE because "data.description" is ambiguous, we need to specify the full path
            QueryField("message.data.description", "Test description")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue())
            .isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, query by attribute name or json property name`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        // query by attribute name (uuid)
        val wrapper1 = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val result = dbService.findAll(DocumentWrapperType::class, listOf(QueryField("uuid", docId)), FindOptions())
            Assertions.assertThat(result.totalHits).isEqualTo(1)
            result.hits[0]
        }

        // query by json property name (_id)
        val wrapper2 = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val result = dbService.findAll(DocumentWrapperType::class, listOf(QueryField("_id", docId)), FindOptions())
            Assertions.assertThat(result.totalHits).isEqualTo(1)
            result.hits[0]
        }

        Assertions.assertThat(wrapper1["db_id"]).isNotNull
        Assertions.assertThat(wrapper2["db_id"]).isNotNull
        Assertions.assertThat(wrapper1["db_id"]).isEqualTo(wrapper2["db_id"])
    }

    @Test
    fun `finding documents by query, query with joins`() {
        val query = "Test Doc"
        val cat = "address"

        val queryOptions = QueryOptions(
            queryType = QueryType.LIKE,
            queryOperator = QueryOperator.AND
        )
        val queryMap = listOf(
            Pair(
                listOf(
                    QueryField(FIELD_CATEGORY, " =", cat),
                    QueryField("draft.title", query),
                    QueryField("draft.lastName", "Mustermann")
                ), queryOptions
            ),
            Pair(
                listOf(
                    QueryField(FIELD_CATEGORY, " =", cat),
                    QueryField("draft", null),
                    QueryField("published.title", query),
                    QueryField("published.data.lastName", "Mustermann")
                ), queryOptions
            )
        )

        val findOptions = FindOptions(
            queryOperator = QueryOperator.OR,
            size = 10,
            sortField = "_modified",
            sortOrder = "ASC",
            resolveReferences = true
        )
        val result = dbService.acquireCatalog("test_catalog").use {
            dbService.findAllExt(DocumentWrapperType::class, queryMap, findOptions)
        }
        Assertions.assertThat(result.totalHits).isEqualTo(1)

        Assertions.assertThat(dbService.getLastQuery()).isEqualTo(
            "SELECT *, GREATEST(document1.modified, document2.modified) as query_sort_field " +
                    "FROM document_wrapper document_wrapper1 " +
                    "LEFT JOIN document document1 ON document_wrapper1.draft = document1.id " +
                    "LEFT JOIN document document2 ON document_wrapper1.published = document2.id " +
                    "WHERE  " +
                    "(document_wrapper1.category = :p1_0 AND " +
                    "document1.title ILIKE :p1_1 AND " +
                    "document1.data->>'lastName' ILIKE :p1_2)  " +
                    "OR  " +
                    "(document_wrapper1.category = :p2_0 AND " +
                    "document_wrapper1.draft IS NULL AND " +
                    "document2.title ILIKE :p2_2 AND " +
                    "document2.data->>'lastName' ILIKE :p2_3)  " +
                    "ORDER BY query_sort_field ASC LIMIT 10"
        )
    }

    @Test
    fun `finding documents by query, query by unwrapped superclass attribute`() {
        // data attribute of UserInfo is mapped by base class and unwrapped
        val queryMap = listOfNotNull(
            QueryField("recentLogins", "", true) // recentLogins != ''
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                queryOperator = QueryOperator.AND
            )
            dbService.findAll(UserInfoType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("recentLogins")?.isArray)
    }

    /* TODO: @Test
    fun `finding documents by query, query by wrapped superclass attribute`() {
        // data attribute of Behaviour is mapped by base class and wrapped
        val queryMap = listOfNotNull(
            QueryField("data.duration", "1200")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                queryOperator = QueryOperator.AND
            )
            dbService.findAll(BehaviourType::class, queryMap, findOptions)
        }
//        behaviourRepo.findAll

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("duration")?.intValue()).isEqualTo(1200)
    }*/

    @Test
    fun `finding documents by query, query by mapped (many-to-many) relation`() {
        val queryMap = listOfNotNull(
            QueryField("catalogIds", "test_catalog")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryType = QueryType.CONTAINS,
                resolveReferences = false
            )
            dbService.findAll(UserInfoType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("catalogIds")?.isArray).isTrue
        Assertions.assertThat(result.hits[0].get("catalogIds")?.size()).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("catalogIds")?.get(0)?.textValue()).isEqualTo("test_catalog")
    }

    @Test
    fun `finding documents by query, resolve references`() {
        val queryMap = listOfNotNull(
            QueryField("_id", "4e91e8f8-1e16-c4d2-6689-02adc03fb352"),
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                queryOperator = QueryOperator.AND,
                resolveReferences = true
            )
            dbService.findAll(DocumentWrapperType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get(FIELD_ID)?.textValue())
            .isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")

        val loadedDoc = result.hits[0]
        Assertions.assertThat(loadedDoc.get(FIELD_DRAFT)?.isObject).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_DRAFT)?.get(FIELD_ID)?.textValue())
            .isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc.get(FIELD_PUBLISHED)?.get(FIELD_ID)?.textValue())
            .isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE)?.isArray).isTrue
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).size()).isEqualTo(1)
        Assertions.assertThat(loadedDoc.get(FIELD_ARCHIVE).get(0).get(FIELD_ID)?.textValue())
            .isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
    }

    @Test
    fun `finding all catalogs`() {
        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(2)
        Assertions.assertThat(catalogs[0]).isEqualTo("test_catalog")
        Assertions.assertThat(catalogs[1]).isEqualTo("test_catalog_2")

        Assertions.assertThat(dbService.currentCatalog).isNull()
        dbService.acquireCatalog("test_catalog").use {
            Assertions.assertThat(dbService.currentCatalog).isEqualTo("test_catalog")
        }
        Assertions.assertThat(dbService.currentCatalog).isNull()
    }

    @Test
    fun `checking catalog existence`() {
        Assertions.assertThat(dbService.catalogExists("test_catalog")).isTrue
        Assertions.assertThat(dbService.catalogExists("not_existing_catalog")).isFalse
    }

    @Test
    fun `creating a catalog`() {
        val settings = Catalog(null, "Test Catalog 3", "Test Catalog 3 description", "mcloud")
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        val catalogId = dbService.createCatalog(settings)

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount + 1)
        Assertions.assertThat(catalogId).isEqualTo("test_catalog_3")

        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(3)
        Assertions.assertThat(catalogs[0]).isEqualTo("test_catalog")
        Assertions.assertThat(catalogs[1]).isEqualTo("test_catalog_2")
        Assertions.assertThat(catalogs[2]).isEqualTo("test_catalog_3")

        var result: List<JsonNode>?
        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            result = dbService.findAll(CatalogInfoType::class)
        }
        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(3)

        val loadedCatalog = result?.first { t -> t.get("id").textValue() == "test_catalog_3" }
        Assertions.assertThat(loadedCatalog as JsonNode).isNotNull
        Assertions.assertThat(loadedCatalog.get("db_id")).isNotNull
        Assertions.assertThat(loadedCatalog.get("id")?.textValue()).isEqualTo("test_catalog_3")
        Assertions.assertThat(loadedCatalog.get("name")?.textValue()).isEqualTo("Test Catalog 3")
        Assertions.assertThat(loadedCatalog.get("description")?.textValue()).isEqualTo("Test Catalog 3 description")
        Assertions.assertThat(loadedCatalog.get("type")?.textValue()).isEqualTo("mcloud")
    }

    @Test
    fun `updating a catalog`() {
        val catalogId = 100
        val settings = Catalog("test_catalog", "Test Catalog 2", "Test Catalog 2 description", "uvp")
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        dbService.updateCatalog(settings)

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount)

        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(2)
        Assertions.assertThat(Arrays.stream(catalogs).anyMatch { t -> t == "test_catalog" }).isTrue
        Assertions.assertThat(Arrays.stream(catalogs).anyMatch { t -> t == "test_catalog_2" }).isTrue

        var result: List<JsonNode>?
        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            result = dbService.findAll(CatalogInfoType::class)
        }
        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(2)

        val loadedCatalog = result?.first { t -> t.get("id").textValue() == "test_catalog" }
        Assertions.assertThat(loadedCatalog as JsonNode).isNotNull
        Assertions.assertThat(loadedCatalog.get("db_id")?.intValue()).isEqualTo(catalogId)
        Assertions.assertThat(loadedCatalog.get("id")?.textValue()).isEqualTo("test_catalog")
        Assertions.assertThat(loadedCatalog.get("name")?.textValue()).isEqualTo("Test Catalog 2")
        Assertions.assertThat(loadedCatalog.get("description")?.textValue()).isEqualTo("Test Catalog 2 description")
        Assertions.assertThat(loadedCatalog.get("type")?.textValue()).isEqualTo("uvp") // type cannot be changed
    }

    @Test
    fun `deleting a catalog`() {
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        dbService.removeCatalog("test_catalog")

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount - 1)

        // owned entities are deleted
        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(0)
        Assertions.assertThat(dbService.findAll(DocumentWrapperType::class).size).isEqualTo(0)
        Assertions.assertThat(behaviourRepo.count()).isEqualTo(0)

        // user still exists
        Assertions.assertThat(dbService.findAll(UserInfoType::class).size).isEqualTo(1)
    }

    @Test
    fun `deleting a not existing catalog`() {
        val exception = shouldThrow<PersistenceException> {
            dbService.removeCatalog("not_existing_catalog")
        }

        Assertions.assertThat(exception.message).startsWith("Failed to delete non-existing catalog")
    }
}