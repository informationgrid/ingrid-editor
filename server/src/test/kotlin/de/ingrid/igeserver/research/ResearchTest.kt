/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.research

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
            FROM document document1
            WHERE document1.is_latest = true AND document1.data ->> 'company' LIKE '%verwaltung%';
        """

            val list = execQuery(sql)
            list.size shouldBeExactly 1
        }
    }

    private fun execQuery(sql: String): List<Any> {
        return entityManager
            .createNativeQuery(sql)
            .unwrap(NativeQuery::class.java)
            .addScalar("data")
            .addScalar("title")
            .addScalar("uuid")
            .addScalar("type")
            .addScalar("created")
            .addScalar("modified")
            .resultList
    }
}
