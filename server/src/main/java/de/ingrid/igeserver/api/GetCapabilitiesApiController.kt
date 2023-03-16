package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.services.CapabilitiesService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api/getCapabilities"])
class GetCapabilitiesApiController(private var capabilitiesService: CapabilitiesService) : GetCapabilitiesApi {

    override fun analyzeGetRecordUrl(url: String): ResponseEntity<GetRecordUrlAnalysis> {
        val response = capabilitiesService.analyzeGetRecordUrl(url)
        return ResponseEntity.ok(response)
    }

    override fun analyzeGetCapabilties(url: String): ResponseEntity<GetCapabilitiesAnalysis> {
        val response = capabilitiesService.analyzeGetCapabilitiesUrl(url)
        return ResponseEntity.ok(response)
    }
}