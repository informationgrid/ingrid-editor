package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AssignmentKey
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogManagerAssignment
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.assertj.core.api.Assertions.assertThat
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.transaction.TestTransaction
import javax.persistence.EntityManager
import javax.transaction.Transactional

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Transactional
class CatalogManagerUserTest : AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var em: EntityManager

    @Test
    fun `assigning a manager to a user and catalog`() {
        val user = UserInfo().apply {
            userId = "Test User"
        }
        em.persist(user)

        val catalog = Catalog().apply {
            name = "Test Catalog"
            identifier = "test_catalog"
            type = "uvp"
        }
        em.persist(catalog)

        val manager = UserInfo().apply {
            userId = "Test Manager"
        }
        em.persist(manager)

        val assignment = CatalogManagerAssignment().apply {
            id = AssignmentKey().apply {
                catalogId = catalog.id as Int
                managerId = manager.id as Int
                userId = user.id as Int
            }
            this.catalog = catalog
            this.manager = manager
            this.user = user
        }
        em.persist(assignment)

        em.flush()
        em.clear()

        TestTransaction.flagForCommit()
        TestTransaction.end()

        // test read
        val loadedAssignment = em.find(CatalogManagerAssignment::class.java, assignment.id)
        assertThat(loadedAssignment?.user?.id).isEqualTo(user.id)
        assertThat(loadedAssignment?.manager?.id).isEqualTo(manager.id)
        assertThat(loadedAssignment?.catalog?.id).isEqualTo(catalog.id)
    }
}
