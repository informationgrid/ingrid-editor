package de.ingrid.igeserver.research

import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.IgeServer
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.ints.shouldBeExactly
import jakarta.persistence.EntityManager
import org.hibernate.query.NativeQuery
import org.intellij.lang.annotations.Language
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig


@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/test_data.sql"], config = SqlConfig(encoding = "UTF-8"))
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles(profiles = ["default", "uvp"])
class ResearchTest : ShouldSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var entityManager: EntityManager

    init {
        should("find by term (exact)") {
            @Language("PostgreSQL") val sql = """
                SELECT *
                FROM document
                WHERE data ->> 'company' = 'LWL-Schulverwaltung Münster';
            """

            val list = execQuery(sql)
            list.size shouldBeExactly 1
        }

        should("find by term (like)") {
            @Language("PostgreSQL") val sql = """
            SELECT *
            FROM document_wrapper
            LEFT JOIN document document1 ON document_wrapper.draft = document1.id
            WHERE document1.data ->> 'company' LIKE '%verwaltung%';
        """

            val list = execQuery(sql)
            list.size shouldBeExactly 1
        }
    }

    private fun execQuery(sql: String): List<Any> {
        return entityManager
            .createNativeQuery(sql)
            .unwrap(NativeQuery::class.java)
            .addScalar("data", JsonNodeBinaryType.INSTANCE)
            .addScalar("title")
            .addScalar("uuid")
            .addScalar("type")
            .addScalar("created")
            .addScalar("modified")
            .resultList
    }
}
