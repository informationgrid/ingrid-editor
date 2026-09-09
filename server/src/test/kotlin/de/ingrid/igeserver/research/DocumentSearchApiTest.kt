/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.DocumentSearchApiController
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.model.TitleOrUuidSearchRequest
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentSearchService
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.http.MediaType
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class DocumentSearchApiTest : AnnotationSpec() {
    private lateinit var searchService: DocumentSearchService
    private lateinit var mvc: MockMvc
    private val principal = UsernamePasswordAuthenticationToken("test-user", "")
    private val mapper = jacksonObjectMapper()

    @BeforeEach
    fun setup() {
        searchService = mockk(relaxed = true)
        val catalogService = mockk<CatalogService>()
        every { catalogService.getCurrentCatalogForPrincipal(principal) } returns "current-catalog"
        every { searchService.findInTitleOrUuid(any(), any(), any()) } returns ResearchResponse(0, emptyList())
        mvc = MockMvcBuilders.standaloneSetup(DocumentSearchApiController(searchService, catalogService))
            .setMessageConverters(MappingJackson2HttpMessageConverter(mapper))
            .build()
    }

    @Test
    fun `title search accepts unchanged values with defaults and uses the session catalog`() {
        val term = " O'Brien %_ "
        mvc.perform(
            post("/api/search/titleOrUuid").principal(principal).contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(mapOf("term" to term))),
        )
            .andExpect(status().isOk)
            .andExpect(content().json("""{"totalHits":0,"hits":[]}"""))
        verify { searchService.findInTitleOrUuid("current-catalog", principal, TitleOrUuidSearchRequest(term)) }
    }

    @Test
    fun `invalid categories page sizes and missing required fields are rejected`() {
        listOf(
            """{"term":"","category":"data' OR 1=1 --"}""",
            """{"term":"","pageSize":0}""",
            """{"term":"","pageSize":-1}""",
            """{}""",
            """{"term":null}""",
        ).forEach { body ->
            mvc.perform(post("/api/search/titleOrUuid").principal(principal).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest)
        }
        verify(exactly = 0) { searchService.findInTitleOrUuid(any(), any(), any()) }
    }

    @Test
    fun `profile endpoints return a boolean and a title list`() {
        every { searchService.hasCoupledServiceWithGetCapabilities("current-catalog", principal, "uuid") } returns true
        mvc.perform(
            post("/api/search/hasCoupledServiceWithGetCapabilities").principal(principal)
                .contentType(MediaType.APPLICATION_JSON).content("""{"uuid":"uuid"}"""),
        )
            .andExpect(status().isOk).andExpect(content().string("true"))

        every { searchService.getHmbtgDocumentTitles("current-catalog", principal, listOf("one", "two")) } returns listOf("Same", "Same")
        mvc.perform(
            post("/api/search/hmbtgDocumentTitles").principal(principal)
                .contentType(MediaType.APPLICATION_JSON).content("""{"uuids":["one","two"]}"""),
        )
            .andExpect(status().isOk).andExpect(content().json("""["Same","Same"]"""))
    }
}
