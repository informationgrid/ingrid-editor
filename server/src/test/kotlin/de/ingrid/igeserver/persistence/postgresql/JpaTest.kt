package de.ingrid.igeserver.persistence.postgresql

import IntegrationTest
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DOCUMENT_STATE
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle


@Transactional
class JpaTest : IntegrationTest() {

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
            state = DOCUMENT_STATE.DRAFT
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
        loadedCat?.id shouldBe cat.id
        loadedCat?.name shouldBe "Test Catalog"
        loadedCat?.type shouldBe "uvp"

        val loadedDoc = em.find(Document::class.java, doc.id)
        loadedDoc?.id shouldBe doc.id
        loadedDoc?.title shouldBe "Test Document"
        loadedDoc?.type shouldBe "AddressDoc"
        loadedDoc?.catalog shouldBe loadedCat
        loadedDoc?.created shouldNotBe null
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        convertDate(loadedDoc.modified) shouldBe convertDate(loadedDoc.created)

        val addressData = loadedDoc.data
        addressData shouldNotBe null
        addressData.get("firstName").asText() shouldBe "Petra"
        addressData.get("lastName").asText() shouldBe "Mustermann"
        addressData.get("company").asText() shouldBe "LWL-Schulverwaltung Münster"
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
            state = DOCUMENT_STATE.DRAFT
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
        loadedCat?.id shouldBe cat.id
        loadedCat?.name shouldBe "Test Catalog"
        loadedCat?.type shouldBe "uvp"

        val loadedDoc = em.find(Document::class.java, doc.id)
        loadedDoc?.id shouldBe doc.id
        loadedDoc?.title shouldBe "Test Document"
        loadedDoc?.type shouldBe "AddressDoc"
        loadedDoc?.catalog shouldBe loadedCat
        loadedDoc?.created shouldNotBe null
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        convertDate(loadedDoc.modified) shouldBe convertDate(loadedDoc.created)

        val addressData = loadedDoc.data
        addressData shouldNotBe null
        addressData.get("firstName").asText() shouldBe "Petra"
        addressData.get("lastName").asText() shouldBe "Mustermann"
        addressData.get("company").asText() shouldBe "LWL-Schulverwaltung Münster"
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
            state = DOCUMENT_STATE.DRAFT
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
        result.size shouldBe 1

        val loadedDoc = result[0] as Document
        loadedDoc.id shouldBe doc.id
        loadedDoc.title shouldBe "Test Document"
        loadedDoc.type shouldBe "AddressDoc"
        loadedDoc.catalog shouldNotBe null
        loadedDoc.created shouldNotBe null
        // since created and modified are slightly different (one is created in app the other in entity)
        // we convert the date to ignore milliseconds
        convertDate(loadedDoc.modified) shouldBe convertDate(loadedDoc.created)

        val addressData = loadedDoc.data
        addressData shouldNotBe null
        addressData.get("firstName").asText() shouldBe "Petra"
        addressData.get("lastName").asText() shouldBe "Mustermann"
        addressData.get("company").asText() shouldBe "LWL-Schulverwaltung Münster"

        val q2 =
            em.createNativeQuery("SELECT * FROM document d JOIN catalog c ON d.catalog_id = c.id WHERE c.type = :type")
                .unwrap(NativeQuery::class.java)
                .addEntity("doc", Document::class.java)
                //.addJoin("c", "doc.catalog")
                .setParameter("type", "uvp")
        val result2 = q2.resultList
        result2.size shouldBeExactly 7
    }

    private fun convertDate(date: OffsetDateTime?): String? {
        return date?.format(DateTimeFormatter.ofLocalizedDateTime(FormatStyle.MEDIUM))
    }
}
