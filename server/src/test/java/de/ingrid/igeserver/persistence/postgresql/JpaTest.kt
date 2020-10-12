package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.embeddedMapOf
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Document
import de.ingrid.igeserver.persistence.postgresql.model.document.AddressData
import org.assertj.core.api.Assertions.assertThat
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.junit4.SpringRunner
import javax.persistence.EntityManager
import javax.transaction.Transactional
import org.springframework.test.context.transaction.TestTransaction

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [IgeServer::class])
@ActiveProfiles("postgresql")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class JpaTest {

    @Autowired
    private lateinit var em: EntityManager

    @Test
    fun `saving a document with typed embedded data`() {
        val cat = Catalog(name = "Test Catalog", identifier = "test_catalog", type = "uvp")
        em.persist(cat)

        val address = AddressData(firstName = "Petra", lastName = "Mustermann", company = "LWL-Schulverwaltung Münster")
        val doc = Document(title = "Test Document", catalog = cat, data = address)
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
        assertThat(loadedDoc?.modified).isEqualTo(loadedDoc?.created)

        val addressData = loadedDoc.data as AddressData
        assertThat(addressData).isNotNull
        assertThat(addressData.firstName).isEqualTo("Petra")
        assertThat(addressData.lastName).isEqualTo("Mustermann")
        assertThat(addressData.company).isEqualTo("LWL-Schulverwaltung Münster")
    }

    @Test
    fun `saving a document with generic embedded data`() {
        val cat = Catalog(name = "Test Catalog", identifier = "test_catalog", type = "uvp")
        em.persist(cat)

        val address = embeddedMapOf("firstName" to "Petra", "lastName" to "Mustermann", "company" to "LWL-Schulverwaltung Münster")
        val doc = Document(title = "Test Document", catalog = cat, data = address)
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
        assertThat(loadedDoc?.type).isEqualTo("")
        assertThat(loadedDoc?.catalog).isEqualTo(loadedCat)
        assertThat(loadedDoc?.created).isNotNull
        assertThat(loadedDoc?.modified).isEqualTo(loadedDoc?.created)

        val addressData = loadedDoc.data as Map<*, *>
        assertThat(addressData).isNotNull
        assertThat(addressData["firstName"]).isEqualTo("Petra")
        assertThat(addressData["lastName"]).isEqualTo("Mustermann")
        assertThat(addressData["company"]).isEqualTo("LWL-Schulverwaltung Münster")
    }

    @Test
    fun `querying a document`() {
        val cat = Catalog(name = "Test Catalog", identifier = "test_catalog", type = "uvp")
        em.persist(cat)

        val address = AddressData(firstName = "Petra", lastName = "Mustermann", company = "LWL-Schulverwaltung Münster")
        val doc = Document(title = "Test Document", catalog = cat, data = address)
        em.persist(doc)

        em.flush()
        em.clear()

        // test query
        val q = em.createNativeQuery("SELECT * FROM document WHERE id = :id AND data @> jsonb_build_object('lastName', :lastName)", Document::class.java)
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
        assertThat(loadedDoc.modified).isEqualTo(loadedDoc.created)

        val addressData = loadedDoc.data as AddressData
        assertThat(addressData).isNotNull
        assertThat(addressData.firstName).isEqualTo("Petra")
        assertThat(addressData.lastName).isEqualTo("Mustermann")
        assertThat(addressData.company).isEqualTo("LWL-Schulverwaltung Münster")
    }
}
