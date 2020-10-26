package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.services.*
import io.kotest.assertions.throwables.shouldThrow
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
        val id = 1000

        val loadedDoc = dbService.find(DocumentType::class, id.toString())!!

        Assertions.assertThat(loadedDoc["db_id"].intValue()).isEqualTo(id)
        Assertions.assertThat(loadedDoc["db_version"].intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo(id.toString())

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

        val oldCount = dbService.findAll(DocumentType::class).size

        val savedDoc = dbService.acquireCatalog("test_catalog").use {
            dbService.save(DocumentType::class, null, doc)
        }

        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount + 1)

        Assertions.assertThat(savedDoc.get("db_id")?.intValue()).isNotNull
        Assertions.assertThat(savedDoc.get("db_version")?.intValue()).isEqualTo(0)
        Assertions.assertThat(dbService.getRecordId(savedDoc)).isNotNull

        Assertions.assertThat(savedDoc.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc.get(FIELD_CREATED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc.get(FIELD_MODIFIED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc.get("title")?.textValue()).isEqualTo("Test Document")
        Assertions.assertThat(savedDoc.get("firstName")?.textValue()).isEqualTo("Petra")
        Assertions.assertThat(savedDoc.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc.get("company")?.textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(savedDoc.has("data")).isFalse
        Assertions.assertThat(savedDoc.has("dataFields")).isFalse
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

        Assertions.assertThat(savedDoc.get(FIELD_ID)?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc.get(FIELD_DOCUMENT_TYPE)?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc.get(FIELD_CREATED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc.get(FIELD_MODIFIED)?.textValue()).isNotNull
        Assertions.assertThat(savedDoc.get("title")?.textValue()).isEqualTo("Test Document Geändert")
        Assertions.assertThat(savedDoc.get("firstName")?.textValue()).isEqualTo("Peter")
        Assertions.assertThat(savedDoc.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc.get("company")?.textValue()).isEqualTo("LWL-Kliniken")
        Assertions.assertThat(savedDoc.has("data")).isFalse
        Assertions.assertThat(savedDoc.has("dataFields")).isFalse
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
    fun `deleting a document`() {
        val docId = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        val oldCount = dbService.findAll(DocumentType::class).size

        dbService.acquireDatabase("test_catalog").use {
            dbService.remove(DocumentType::class, docId)
        }

        // all instances with the same uuid are deleted
        Assertions.assertThat(dbService.findAll(DocumentType::class).size).isEqualTo(oldCount - 3)
    }

    @Test
    fun `deleting a not existing document`() {
        val docId = "84e91e8f-61e1-4d2c-6869-0252adc03fb3"

        val exception = dbService.acquireDatabase("test_catalog").use {
            shouldThrow<PersistenceException> {
                dbService.remove(DocumentType::class, docId)
            }
        }

        Assertions.assertThat(exception.message).startsWith("Failed to delete non-existing document")
    }

    @Test
    fun `getting a record id`() {
        val catalogRecordId = dbService.getRecordId(CatalogInfoType::class, "test_catalog")!!
        Assertions.assertThat(catalogRecordId).isEqualTo("100")

        val behaviourRecordId = dbService.getRecordId(BehaviourType::class, "plugin.sort.tree.by.type")!!
        Assertions.assertThat(behaviourRecordId).isEqualTo("201")
    }

    @Test
    fun `counting children`() {
        val count = dbService.countChildren("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(count).isEqualTo(2)
    }

    @Test
    fun `finding all documents`() {
        val result = dbService.acquireDatabase("audit_log").use {
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

        val result = dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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

        val result = dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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

        val result = dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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
                        QueryField("draft.title", query),
                        QueryField("draft.lastName", "Mustermann")
                ), queryOptions),
                Pair(listOf(
                        QueryField(FIELD_CATEGORY, " =", cat),
                        QueryField("draft", null),
                        QueryField("published.title", query),
                        QueryField("published.data.lastName", "Mustermann")
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

        Assertions.assertThat(dbService.getLastQuery()).isEqualTo(
                "SELECT *, GREATEST(document1.modified, document2.modified) as query_sort_field " +
                "FROM document_wrapper document_wrapper1 " +
                "JOIN document document1 ON document_wrapper1.draft = document1.id " +
                "JOIN document document2 ON document_wrapper1.published = document2.id " +
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
    fun `checking catalog existence`() {
        Assertions.assertThat(dbService.catalogExists("test_catalog")).isTrue
        Assertions.assertThat(dbService.catalogExists("not_existing_catalog")).isFalse
    }

    @Test
    fun `creating a catalog`() {
        val settings = Catalog(null, "Test Catalog 2", "Test Catalog 2 description", "mcloud")
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        val catalogId = dbService.createCatalog(settings)

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount + 1)
        Assertions.assertThat(catalogId).isEqualTo("test_catalog_2")

        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(2)
        Assertions.assertThat(catalogs[0]).isEqualTo("test_catalog")
        Assertions.assertThat(catalogs[1]).isEqualTo("test_catalog_2")

        var result: List<JsonNode>?
        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            result = dbService.findAll(CatalogInfoType::class)
        }
        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(2)

        val loadedCatalog = result?.get(1)
        Assertions.assertThat(loadedCatalog?.get("db_id")).isNotNull
        Assertions.assertThat(loadedCatalog?.get("id")?.textValue()).isEqualTo("test_catalog_2")
        Assertions.assertThat(loadedCatalog?.get("name")?.textValue()).isEqualTo("Test Catalog 2")
        Assertions.assertThat(loadedCatalog?.get("description")?.textValue()).isEqualTo("Test Catalog 2 description")
        Assertions.assertThat(loadedCatalog?.get("type")?.textValue()).isEqualTo("mcloud")
    }

    @Test
    fun `updating a catalog`() {
        val catalogId = 100
        val settings = Catalog("test_catalog", "Test Catalog 2", "Test Catalog 2 description", "uvp")
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        dbService.updateCatalog(settings)

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount)

        val catalogs = dbService.catalogs
        Assertions.assertThat(catalogs.size).isEqualTo(1)
        Assertions.assertThat(catalogs[0]).isEqualTo("test_catalog")

        var result: List<JsonNode>?
        dbService.acquireDatabase("is_not_used_by_postgresql").use {
            result = dbService.findAll(CatalogInfoType::class)
        }
        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(1)

        val loadedCatalog = result?.get(0)
        Assertions.assertThat(loadedCatalog?.get("db_id")?.intValue()).isEqualTo(catalogId)
        Assertions.assertThat(loadedCatalog?.get("id")?.textValue()).isEqualTo("test_catalog")
        Assertions.assertThat(loadedCatalog?.get("name")?.textValue()).isEqualTo("Test Catalog 2")
        Assertions.assertThat(loadedCatalog?.get("description")?.textValue()).isEqualTo("Test Catalog 2 description")
        Assertions.assertThat(loadedCatalog?.get("type")?.textValue()).isEqualTo("uvp") // type cannot be changed
    }

    @Test
    fun `deleting a catalog`() {
        val oldCount = dbService.findAll(CatalogInfoType::class).size

        dbService.removeCatalog("test_catalog")

        Assertions.assertThat(dbService.findAll(CatalogInfoType::class).size).isEqualTo(oldCount - 1)
    }

    @Test
    fun `deleting a not existing catalog`() {
        val exception = shouldThrow<PersistenceException> {
            dbService.removeCatalog("not_existing_catalog")
        }

        Assertions.assertThat(exception.message).startsWith("Failed to delete non-existing catalog")
    }
}