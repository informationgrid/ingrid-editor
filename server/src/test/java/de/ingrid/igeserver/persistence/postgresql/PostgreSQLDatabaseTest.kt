package de.ingrid.igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.model.document.DocumentType
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest(classes=[IgeServer::class])
@ActiveProfiles("postgresql")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(statements = [
    "TRUNCATE TABLE document RESTART IDENTITY CASCADE;",
    "TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;",
    "INSERT INTO catalog VALUES (1000, 'test_catalog', 'uvp', 'Test Catalog', NULL, NULL);",
    "INSERT INTO document VALUES (1000, 1000, '4e91e8f8-1e16-c4d2-6689-02adc03fb352', 'AddressDoc', 'Test Document', " +
        "'{\"company\": \"LWL-Schulverwaltung Münster\", \"lastName\": \"Mustermann\", \"firstName\": \"Petra\"}', " +
        "0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00');"
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
        dbService.acquire("test_catalog").use {
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
        dbService.acquire("test_catalog").use {
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
}