package igeserver.persistence.postgresql

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import org.assertj.core.api.Assertions.assertThat
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import javax.persistence.EntityManager
import javax.transaction.Transactional

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class JpaTest : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var em: EntityManager

    @Test
    fun `saving a document with typed embedded data`() {
        val cat = Catalog().apply {
            name = "Test Catalog"
            identifier = "test_catalog"
            type = "uvp"
        }
        em.persist(cat)

        val address = jacksonObjectMapper().createObjectNode().apply {
            put("firstName", "Petra")
            put("lastName", "Mustermann")
            put("company", "LWL-Schulverwaltung Münster")
        }
        val doc = Document().apply {
            title = "Test Document"
            type = "AddressDoc"
            data = address
            catalog = cat
            created = OffsetDateTime.now()
        }
        em.persist(doc)

        em.flush()
        em.clear()

        // uncomment to commit changes to the database
        //TestTransaction.flagForCommit()
        //TestTransaction.end()
        //return

        // test read
        val loadedCat = em.find(Catalog::class.java, cat.id)
        assertThat(loadedCat?.id).isEqualTo(cat.id)
        assertThat(loadedCat?.name).isEqualTo("Test Catalog")
        assertThat(loadedCat?.type).isEqualTo("uvp")

        val loadedDoc = em.find(Document::class.java, doc.id)
        assertThat(loadedDoc?.id).isEqualTo(doc.id)
        assertThat(loadedDoc?.title).isEqualTo("Test Document")
        assertThat(loadedDoc?.type).isEqualTo("AddressDoc")
        assertThat(loadedDoc?.catalog).isEqualTo(loadedCat)
        assertThat(loadedDoc?.created).isNotNull
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        assertThat(convertDate(loadedDoc.modified)).isEqualTo(convertDate(loadedDoc.created))

        val addressData = loadedDoc.data
        assertThat(addressData).isNotNull
        assertThat(addressData.get("firstName").asText()).isEqualTo("Petra")
        assertThat(addressData.get("lastName").asText()).isEqualTo("Mustermann")
        assertThat(addressData.get("company").asText()).isEqualTo("LWL-Schulverwaltung Münster")
    }

    @Test
    fun `saving a document with generic embedded data`() {
        val cat = Catalog().apply {
            name = "Test Catalog"
            identifier = "test_catalog"
            type = "uvp"
        }
        em.persist(cat)

        val address =
            mapOf("firstName" to "Petra", "lastName" to "Mustermann", "company" to "LWL-Schulverwaltung Münster")
        val addressJson = jacksonObjectMapper().convertValue(address, JsonNode::class.java)
        val doc = Document().apply {
            title = "Test Document"
            type = "AddressDoc"
            data = addressJson as ObjectNode
            catalog = cat
            created = OffsetDateTime.now()
        }
        em.persist(doc)

        em.flush()
        em.clear()

        // uncomment to commit changes to the database
        //TestTransaction.flagForCommit()
        //TestTransaction.end()
        //return

        // test read
        val loadedCat = em.find(Catalog::class.java, cat.id)
        assertThat(loadedCat?.id).isEqualTo(cat.id)
        assertThat(loadedCat?.name).isEqualTo("Test Catalog")
        assertThat(loadedCat?.type).isEqualTo("uvp")

        val loadedDoc = em.find(Document::class.java, doc.id)
        assertThat(loadedDoc?.id).isEqualTo(doc.id)
        assertThat(loadedDoc?.title).isEqualTo("Test Document")
        assertThat(loadedDoc?.type).isEqualTo("AddressDoc")
        assertThat(loadedDoc?.catalog).isEqualTo(loadedCat)
        assertThat(loadedDoc?.created).isNotNull
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        assertThat(convertDate(loadedDoc.modified)).isEqualTo(convertDate(loadedDoc.created))

        val addressData = loadedDoc.data
        assertThat(addressData).isNotNull
        assertThat(addressData.get("firstName").asText()).isEqualTo("Petra")
        assertThat(addressData.get("lastName").asText()).isEqualTo("Mustermann")
        assertThat(addressData.get("company").asText()).isEqualTo("LWL-Schulverwaltung Münster")
    }

    @Test
    fun `querying a document`() {
        val cat = Catalog().apply {
            name = "Test Catalog"
            identifier = "test_catalog"
            type = "uvp"
        }
        em.persist(cat)

        val address = jacksonObjectMapper().createObjectNode().apply {
            put("firstName", "Petra")
            put("lastName", "Mustermann")
            put("company", "LWL-Schulverwaltung Münster")
        }
        val doc = Document().apply {
            title = "Test Document"
            type = "AddressDoc"
            data = address
            catalog = cat
            created = OffsetDateTime.now()
        }
        em.persist(doc)

        em.flush()
        em.clear()

        // test query
        val q = em.createNativeQuery(
            "SELECT * FROM document WHERE id = :id AND data @> jsonb_build_object('lastName', :lastName)",
            Document::class.java
        )
            .setParameter("id", doc.id)
            .setParameter("lastName", "Mustermann")
        val result = q.resultList
        assertThat(result.size).isEqualTo(1)

        val loadedDoc = result[0] as Document
        assertThat(loadedDoc.id).isEqualTo(doc.id)
        assertThat(loadedDoc.title).isEqualTo("Test Document")
        assertThat(loadedDoc.type).isEqualTo("AddressDoc")
        assertThat(loadedDoc.catalog).isNotNull
        assertThat(loadedDoc.created).isNotNull
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        assertThat(convertDate(loadedDoc.modified)).isEqualTo(convertDate(loadedDoc.created))

        val addressData = loadedDoc.data
        assertThat(addressData).isNotNull
        assertThat(addressData.get("firstName").asText()).isEqualTo("Petra")
        assertThat(addressData.get("lastName").asText()).isEqualTo("Mustermann")
        assertThat(addressData.get("company").asText()).isEqualTo("LWL-Schulverwaltung Münster")

        val q2 =
            em.createNativeQuery("SELECT * FROM document d JOIN catalog c ON d.catalog_id = c.id WHERE c.type = :type")
                .unwrap(NativeQuery::class.java)
                .addEntity("doc", Document::class.java)
                //.addJoin("c", "doc.catalog")
                .setParameter("type", "uvp")
        val result2 = q2.resultList
        assertThat(result2.size).isEqualTo(7)
    }

    private fun convertDate(date: OffsetDateTime?): String? {
        return date?.format(DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM))
    }
}
