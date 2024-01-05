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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.services.CapabilitiesService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.getCapabilities.CapabilitiesBean
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/getCapabilities"])
class GetCapabilitiesApiController(private val capabilitiesService: CapabilitiesService, private val catalogService: CatalogService) : GetCapabilitiesApi {

    override fun analyzeGetRecordUrl(url: String): ResponseEntity<GetRecordUrlAnalysis> {
        val response = capabilitiesService.analyzeGetRecordUrl(url)
        return ResponseEntity.ok(response)
    }

    override fun analyzeGetCapabilties(principal: Principal, url: String): ResponseEntity<CapabilitiesBean> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val response = capabilitiesService.analyzeGetCapabilitiesUrl(principal, catalogId, url)
        return ResponseEntity.ok(response)
    }
}