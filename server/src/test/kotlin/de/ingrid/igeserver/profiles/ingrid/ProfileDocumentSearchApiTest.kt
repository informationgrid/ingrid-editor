/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.profiles.ingrid.api.IngridDocumentSearchApiController
import de.ingrid.igeserver.profiles.ingrid.services.IngridDocumentSearchService
import de.ingrid.igeserver.profiles.ingrid_hmdk.api.HmbtgDocumentSearchApiController
import de.ingrid.igeserver.profiles.ingrid_hmdk.services.HmbtgDocumentSearchService
import de.ingrid.igeserver.services.CatalogService
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.springframework.http.MediaType
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

class ProfileDocumentSearchApiTest : AnnotationSpec() {
    private val principal = UsernamePasswordAuthenticationToken("test-user", "")
    private val mapper = jacksonObjectMapper()

    @Test
    fun `HMDK route forwards the request and session catalog`() {
        val catalogService = mockk<CatalogService>()
        val searchService = mockk<HmbtgDocumentSearchService>()
        every { catalogService.getCurrentCatalogForPrincipal(principal) } returns "current-catalog"
        every { searchService.getDocumentTitles(any(), any(), any()) } returns listOf("Title")
        val mvc = MockMvcBuilders.standaloneSetup(HmbtgDocumentSearchApiController(catalogService, searchService))
            .setMessageConverters(MappingJackson2HttpMessageConverter(mapper)).build()

        mvc.perform(post("/api/ingrid-hmdk/search/hmbtgDocumentTitles").principal(principal).contentType(MediaType.APPLICATION_JSON).content("""{"uuids":["one","one"]}"""))
            .andExpect(status().isOk).andExpect(content().json("[\"Title\"]"))
        verify { searchService.getDocumentTitles("current-catalog", principal, listOf("one", "one")) }
    }

    @Test
    fun `Ingrid route forwards the request and session catalog`() {
        val catalogService = mockk<CatalogService>()
        val searchService = mockk<IngridDocumentSearchService>()
        every { catalogService.getCurrentCatalogForPrincipal(principal) } returns "current-catalog"
        every { searchService.hasCoupledServiceWithGetCapabilities(any(), any(), any()) } returns true
        val mvc = MockMvcBuilders.standaloneSetup(IngridDocumentSearchApiController(catalogService, searchService))
            .setMessageConverters(MappingJackson2HttpMessageConverter(mapper)).build()

        mvc.perform(post("/api/ingrid/search/hasCoupledServiceWithGetCapabilities").principal(principal).contentType(MediaType.APPLICATION_JSON).content("""{"uuid":"one"}"""))
            .andExpect(status().isOk).andExpect(content().string("true"))
        verify { searchService.hasCoupledServiceWithGetCapabilities("current-catalog", principal, "one") }
    }
}
