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