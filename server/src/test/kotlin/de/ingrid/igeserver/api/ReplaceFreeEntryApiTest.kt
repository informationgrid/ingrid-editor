/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api

import IntegrationTest
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@Sql(scripts = ["/test_data-free-entries.sql"], config = SqlConfig(encoding = "UTF-8"))
class ReplaceFreeEntryApiTest(private val mockMvc: MockMvc) : IntegrationTest() {

    private val mapper = jacksonObjectMapper()

    private val mockPrincipal = UsernamePasswordAuthenticationToken(
        "user1",
        null,
        listOf(SimpleGrantedAuthority("cat-admin")),
    )

    @BeforeEach
    fun setup() {
        SecurityContextHolder.getContext().authentication = mockPrincipal
    }

    @AfterEach
    fun tearDown() {
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `should replace free entry across documents and return result`() {
        val body = mapper.writeValueAsString(
            mapOf(
                "fromValue" to "Free A",
                "toKey" to "1",
            ),
        )

        val result = mockMvc.perform(
            post("/api/codelist/free-entries/4300/replace")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body)
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
            .andReturn()

        val json = mapper.readTree(result.response.contentAsString)
        json.get("occurrences").asInt() shouldBe 2
        json.get("documentsUpdated").asInt() shouldBe 2
        val uuids = json.get("uuids").map { it.asText() }
        uuids.shouldContainExactlyInAnyOrder(listOf("free-uuid-1", "free-uuid-2"))

        // After replacement, counts should only contain Free B (1)
        val countsAfter = mockMvc.perform(
            get("/api/codelist/free-entries/4300")
                .accept(MediaType.APPLICATION_JSON)
                .principal(mockPrincipal),
        )
            .andExpect(status().isOk)
            .andReturn()

        val array = mapper.readTree(countsAfter.response.contentAsString)
        val map = array.associate { node ->
            node.get("value").asText() to node.get("count").asInt()
        }
        map.size shouldBe 1
        map["Free B"] shouldBe 1
    }
}
