package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.services.*
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDateTime
import java.time.Month
import java.time.format.DateTimeFormatter

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [IgeServer::class])
@ActiveProfiles("postgresql")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data.sql"], config=SqlConfig(encoding="UTF-8"))
class PostgreSQLDatabaseTest {

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Test
    fun `loading a document`() {
        val id = "1000"

        val loadedDoc = dbService.find(DocumentType::class, id)!!

        Assertions.assertThat(loadedDoc["db_id"].intValue()).isEqualTo(1000)
        Assertions.assertThat(loadedDoc["db_version"].intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo("1000")

        Assertions.assertThat(loadedDoc[FIELD_ID].textValue()).isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc[FIELD_DOCUMENT_TYPE].textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc[FIELD_CREATED].textValue()).isEqualTo("2020-10-10 00:48:28")
        Assertions.assertThat(loadedDoc[FIELD_MODIFIED].textValue()).isEqualTo("2020-10-10 00:48:28")
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
                "company":"LWL-Schulverwaltung Münster"
            }
        """

        var savedDoc: JsonNode?
        dbService.acquireCatalog("test_catalog").use {
            savedDoc = dbService.save(DocumentType::class, null, doc)
        }

        Assertions.assertThat(savedDoc?.get("db_id")?.intValue()).isNotNull
        Assertions.assertThat(savedDoc?.get("db_version")?.intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(savedDoc!!)).isNotNull

        Assertions.assertThat(savedDoc?.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc?.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc?.get(FIELD_CREATED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc?.get(FIELD_MODIFIED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc?.get("title")?.textValue()).isEqualTo("Test Document")
        Assertions.assertThat(savedDoc?.get("firstName")?.textValue()).isEqualTo("Petra")
        Assertions.assertThat(savedDoc?.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc?.get("company")?.textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(savedDoc?.has("data")).isFalse
        Assertions.assertThat(savedDoc?.has("dataFields")).isFalse
    }

    @Test
    fun `updating a document`() {
        val doc = """
            {
                "_id":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "_type":"AddressDoc",
                "title":"Test Document Geändert",
                "firstName":"Peter",
                "company":"LWL-Kliniken"
            }
        """

        var savedDoc: JsonNode?
        dbService.acquireCatalog("test_catalog").use {
            savedDoc = dbService.save(DocumentType::class, "1000", doc)
        }

        Assertions.assertThat(savedDoc?.get("db_id")?.intValue()).isEqualTo(1000)
        Assertions.assertThat(savedDoc?.get("db_version")?.intValue()).isEqualTo(1)
        Assertions.assertThat(dbService.getRecordId(savedDoc!!)).isEqualTo("1000")

        Assertions.assertThat(savedDoc?.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc?.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc?.get(FIELD_CREATED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc?.get(FIELD_MODIFIED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc?.get("title")?.textValue()).isEqualTo("Test Document Geändert")
        Assertions.assertThat(savedDoc?.get("firstName")?.textValue()).isEqualTo("Peter")
        Assertions.assertThat(savedDoc?.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc?.get("company")?.textValue()).isEqualTo("LWL-Kliniken")
        Assertions.assertThat(savedDoc?.has("data")).isFalse
        Assertions.assertThat(savedDoc?.has("dataFields")).isFalse
    }

    @Test
    fun `getting a record id`() {
        val catalogId = dbService.getRecordId(CatalogInfoType::class, "test_catalog")!!
        Assertions.assertThat(catalogId).isEqualTo("100")

        val behaviourId = dbService.getRecordId(BehaviourType::class, "plugin.sort.tree.by.type")!!
        Assertions.assertThat(behaviourId).isEqualTo("201")
    }

    @Test
    fun `counting children`() {
        val count = dbService.countChildren("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(count).isEqualTo(2)
    }

    @Test
    fun `finding all documents`() {
        var result: List<JsonNode>?
        dbService.acquireDatabase("audit_log").use {
            result = dbService.findAll(AuditLogRecordType::class)
        }

        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(3)
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

        var result: FindAllResults?
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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

        var result: FindAllResults?
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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

        var result: FindAllResults?
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, query by attribute name or json property name`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        // query by attribute name (uuid)
        val wrapper1 = dbService.acquireDatabase("test_catalog").use {
            val result = dbService.findAll(DocumentWrapperType::class, listOf(QueryField("uuid", docId)), FindOptions())
            Assertions.assertThat(result.totalHits).isEqualTo(1)
            result.hits[0]
        }

        // query by json property name (_id)
        val wrapper2 = dbService.acquireDatabase("test_catalog").use {
            val result = dbService.findAll(DocumentWrapperType::class, listOf(QueryField("_id", docId)), FindOptions())
            Assertions.assertThat(result.totalHits).isEqualTo(1)
            result.hits[0]
        }

        Assertions.assertThat(wrapper1["db_id"]).isNotNull
        Assertions.assertThat(wrapper2["db_id"]).isNotNull
        Assertions.assertThat(wrapper1["db_id"]).isEqualTo(wrapper2["db_id"])
    }

    @Test
    fun `finding documents by query with joins`() {
        val query = "Test Doc"
        val cat = "address"

        val queryOptions = QueryOptions(
                queryType = QueryType.LIKE,
                queryOperator = QueryOperator.AND
        )
        val queryMap = listOf(
                Pair(listOf(
                        QueryField(FIELD_CATEGORY, " =", cat),
                        QueryField("draft.title", query)
                ), queryOptions),
                Pair(listOf(
                        QueryField(FIELD_CATEGORY, " =", cat),
                        QueryField("draft", null),
                        QueryField("published.title", query)
                ), queryOptions)
        )

        val findOptions = FindOptions(
                queryOperator = QueryOperator.OR,
                size = 10,
                sortField = "_modified",
                sortOrder = "ASC",
                resolveReferences = true)
        val result = dbService.acquireCatalog("test_catalog").use {
            dbService.findAllExt(DocumentWrapperType::class, queryMap, findOptions)
        }
        Assertions.assertThat(result.totalHits).isEqualTo(1)
    }

    @Test
    fun `finding all catalogs`() {
        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(1)
        Assertions.assertThat(catalogs[0]).isEqualTo("test_catalog")

        Assertions.assertThat(dbService.currentCatalog).isNull()
        dbService.acquireCatalog("test_catalog").use {
            Assertions.assertThat(dbService.currentCatalog).isEqualTo("test_catalog")
        }
        Assertions.assertThat(dbService.currentCatalog).isNull()
    }

    @Test
    fun `deleting a document`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
        val queryMap = listOfNotNull(
                QueryField("_id", docId)
        ).toList()

        dbService.acquireDatabase("test_catalog").use {
            Assertions.assertThat(dbService.findAll(DocumentType::class, queryMap, FindOptions()).totalHits).isEqualTo(3)
            dbService.remove(DocumentType::class, docId)
        }

        dbService.acquireDatabase("test_catalog").use {
            Assertions.assertThat(dbService.findAll(DocumentType::class, queryMap, FindOptions()).totalHits).isEqualTo(0)
        }
    }
}