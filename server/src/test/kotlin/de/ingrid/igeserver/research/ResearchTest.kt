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

import IntegrationTest
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.shouldBe
import jakarta.persistence.EntityManager
import org.hibernate.query.NativeQuery
import org.intellij.lang.annotations.Language
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig


@Sql(scripts = ["/test_data.sql"], config = SqlConfig(encoding = "UTF-8"))
class ResearchTest : IntegrationTest() {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Test
    fun findByTerm_exact() {
        @Language("PostgreSQL") val sql = """
                SELECT *
                FROM document
                WHERE data ->> 'company' = 'LWL-Schulverwaltung Münster';
            """

        val list = execQuery(sql)
        list.size shouldBeExactly 1
        (list[0] as Array<*>)[2] as String shouldBe "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
    }

    @Test
    fun findByTerm_like() {
        @Language("PostgreSQL") val sql = """
            SELECT *
            FROM document document1
            WHERE document1.is_latest = true AND document1.data ->> 'company' LIKE '%verwaltung%';
        """

        val list = execQuery(sql)
        list.size shouldBeExactly 1 // although two versions of same document are in database
        (list[0] as Array<*>)[2] as String shouldBe "4e91e8f8-1e16-c4d2-6689-02adc03fb352"
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
