package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import org.assertj.core.api.Assertions
import org.junit.Assert
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.junit4.SpringRunner
import java.time.LocalDateTime
import java.time.Month
import java.time.format.DateTimeFormatter

@RunWith(SpringRunner::class)
@SpringBootTest(classes=[IgeServer::class])
@ActiveProfiles("postgresql")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(statements = [
    "TRUNCATE TABLE document RESTART IDENTITY CASCADE;",
    "TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;",
    "TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;",
    "INSERT INTO catalog VALUES (1000, 'test_catalog', 'uvp', 'Test Catalog', NULL, NULL);",
    """
    INSERT INTO document VALUES (1000, 1000, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', '{
            "company": "LWL-Schulverwaltung Münster",
            "lastName": "Mustermann",
            "firstName": "Petra"
        }',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00'
    );
    """,
    """
    INSERT INTO audit_log VALUES (1000, 'AuditLog', '{
            "cat": "data-history", 
            "data": {
                "uuid": "36169aa1-5faf-4d8e-9dd6-18c95012312d", "id": "41", "type": "mCloudDoc", 
                "title": "Test", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
            },
            "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "create", "target": "36169aa1-5faf-4d8e-9dd6-18c95012312d"
        }',
        'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
        '2020-10-13 14:00:54.551484+00'
    );
    """,
    """
    INSERT INTO audit_log VALUES (1001, 'AuditLog', '{
            "cat": "data-history", 
            "data": {
                "uuid": "36169aa1-5faf-4d8e-9dd6-18c95012312d", "id": "41", "type": "mCloudDoc", 
                "title": "Test", "description": "Test description", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
            },
            "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "update", "target": "36169aa1-5faf-4d8e-9dd6-18c95012312d"
        }',
        'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
        '2020-10-13 14:01:54.551484+00'
    );
    """,
    """
    INSERT INTO audit_log VALUES (1002, 'AuditLog', '{
            "cat": "data-history", 
            "data": {
                "uuid": "4e91e8f8-1e16-c4d2-6689-02adc03fb352", "id": "41", "type": "mCloudDoc", 
                "title": "Test2", "version": 1, "created": "2020-10-01T21:06:43.353678100+02:00", "modified": "2020-10-01T21:06:43.353678100+02:00"
            },
            "time": "2020-10-01T21:06:43.389732400+02:00", "actor": "user1", "action": "delete", "target": "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
        }',
        'AuditLogger.kt', 'de.ingrid.igeserver.services.AuditLogger', 'log', '52', 'audit.data-history', 'http-nio-8550-exec-6', 'INFO',
        '2020-10-13 14:02:54.551484+00'
    );
    """
])
class PostgreSQLDatabaseTest {

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Test
    fun `loading a document`() {
        val id = "1000"

        val loadedDoc = dbService.find(DocumentType::class, id)!!

        Assertions.assertThat(loadedDoc["id"].toString()).isEqualTo(id)
        Assertions.assertThat(loadedDoc["version"].intValue()).isEqualTo(0)
        Assertions.assertThat(loadedDoc["uuid"].textValue()).isEqualTo("4e91e8f8-1e16-c4d2-6689-02adc03fb352")
        Assertions.assertThat(loadedDoc["title"].textValue()).isEqualTo("Test Document")
        Assertions.assertThat(loadedDoc["firstName"].textValue()).isEqualTo("Petra")
        Assertions.assertThat(loadedDoc["lastName"].textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(loadedDoc["company"].textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(loadedDoc["type"].textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(loadedDoc.has("data")).isFalse
        Assertions.assertThat(loadedDoc.has("dataFields")).isFalse

        Assertions.assertThat(dbService.getRecordId(loadedDoc)).isEqualTo("1000")
        Assertions.assertThat(dbService.getVersion(loadedDoc)).isEqualTo(0)
    }

    @Test
    fun `creating a document`() {
        val doc = """
            {
                "uuid":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "title":"Test Document",
                "firstName":"Petra",
                "lastName":"Mustermann",
                "company":"LWL-Schulverwaltung Münster",
                "type":"AddressDoc"
            }
        """

        var savedDoc: JsonNode?
        dbService.acquireCatalog("test_catalog").use {
            savedDoc = dbService.save(DocumentType::class, null, doc)
        }

        Assertions.assertThat(savedDoc?.get("id")?.intValue()).isNotNull
        Assertions.assertThat(savedDoc?.get("version")?.intValue()).isEqualTo(0)
        Assertions.assertThat(savedDoc?.get("uuid")?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc?.get("title")?.textValue()).isEqualTo("Test Document")
        Assertions.assertThat(savedDoc?.get("firstName")?.textValue()).isEqualTo("Petra")
        Assertions.assertThat(savedDoc?.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc?.get("company")?.textValue()).isEqualTo("LWL-Schulverwaltung Münster")
        Assertions.assertThat(savedDoc?.get("type")?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc?.has("data")).isFalse
        Assertions.assertThat(savedDoc?.has("dataFields")).isFalse
    }

    @Test
    fun `updating a document`() {
        val doc = """
            {
                "uuid":"e68c9447-9c4e-45cc-9db7-557b3bcc1db9",
                "title":"Test Document Geändert",
                "firstName":"Peter",
                "company":"LWL-Kliniken",
                "type":"AddressDoc"
            }
        """

        var savedDoc: JsonNode?
        dbService.acquireCatalog("test_catalog").use {
            savedDoc = dbService.save(DocumentType::class, "1000", doc)
        }

        Assertions.assertThat(savedDoc?.get("id")?.intValue()).isNotNull
        Assertions.assertThat(savedDoc?.get("version")?.intValue()).isEqualTo(1)
        Assertions.assertThat(savedDoc?.get("uuid")?.textValue()).isEqualTo("e68c9447-9c4e-45cc-9db7-557b3bcc1db9")
        Assertions.assertThat(savedDoc?.get("title")?.textValue()).isEqualTo("Test Document Geändert")
        Assertions.assertThat(savedDoc?.get("firstName")?.textValue()).isEqualTo("Peter")
        Assertions.assertThat(savedDoc?.get("lastName")?.textValue()).isEqualTo("Mustermann")
        Assertions.assertThat(savedDoc?.get("company")?.textValue()).isEqualTo("LWL-Kliniken")
        Assertions.assertThat(savedDoc?.get("type")?.textValue()).isEqualTo("AddressDoc")
        Assertions.assertThat(savedDoc?.has("data")).isFalse
        Assertions.assertThat(savedDoc?.has("dataFields")).isFalse
    }

    @Test
    fun `getting a record id`() {
        val uuid = "4e91e8f8-1e16-c4d2-6689-02adc03fb352"

        val recordId = dbService.getRecordId(DocumentType::class, uuid)!!

        Assertions.assertThat(recordId).isEqualTo("1000")
    }

    @Test
    fun `finding all documents`() {
        var result: List<JsonNode>? = null
        dbService.acquireDatabase("audit_log").use {
            result = dbService.findAll(AuditLogRecordType::class)
        }

        Assertions.assertThat(result).isNotNull
        Assertions.assertThat(result?.size).isEqualTo(3)
    }

    @Test
    fun `finding documents by query, include embedded data column name`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
                QueryField("logger", "audit.data-history"),
                QueryField("message.target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
                QueryField("message.actor", "user1"),
                QueryField("message.time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
                QueryField("message.time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
                QueryField("message.data.description", "Test description")
        ).toList()

        var result: FindAllResults? = null
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false,
                    queryOperator = "AND",
                    sortField = "",
                    sortOrder = ""
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, include embedded data property name`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
                QueryField("logger", "audit.data-history"),
                QueryField("data.target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
                QueryField("data.actor", "user1"),
                QueryField("data.time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
                QueryField("data.time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
                QueryField("data.data.description", "Test description")
        ).toList()

        var result: FindAllResults? = null
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false,
                    queryOperator = "AND",
                    sortField = "",
                    sortOrder = ""
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
    }

    @Test
    fun `finding documents by query, exclude embedded data property or column name`() {
        val from = LocalDateTime.of(2020, Month.OCTOBER, 1, 0, 0, 0)
        val queryMap = listOfNotNull(
                QueryField("logger", "audit.data-history"),
                QueryField("target", "36169aa1-5faf-4d8e-9dd6-18c95012312d"),
                QueryField("actor", "user1"),
                QueryField("time", " >=", from.format(DateTimeFormatter.ISO_LOCAL_DATE)),
                QueryField("time", " <=", from.plusDays(1).format(DateTimeFormatter.ISO_LOCAL_DATE)),
                // NOTE because "data.description" is ambiguous, wen need to specify the full path
                QueryField("message.data.description", "Test description")
        ).toList()

        var result: FindAllResults? = null
        dbService.acquireDatabase("audit_log").use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false,
                    queryOperator = "AND",
                    sortField = "",
                    sortOrder = ""
            )
            result = dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result?.totalHits).isEqualTo(1)
        Assertions.assertThat(result?.hits?.get(0)?.get("data")?.get("uuid")?.textValue()).isEqualTo("36169aa1-5faf-4d8e-9dd6-18c95012312d")
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
}