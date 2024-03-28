package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.services.OgcResourceService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@Profile("ogc-resources-api")
@RequestMapping(path = ["/api/ogc"])
class OgcResourcesApiController(
    private val ogcResourceService: OgcResourceService
): OgcResourcesApi {

    val log = logger()

    override fun postResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
//        properties: String,
        files: List<MultipartFile>
    ): ResponseEntity<String> {
        val userID = principal.name
        ogcResourceService.uploadResourceWithProperties(principal, userID, collectionId, recordId, files)
        return ResponseEntity.ok().build()
    }

    override fun deleteResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String
    ): ResponseEntity<String> {
        val userID = principal.name
        ogcResourceService.deleteResourceWithProperties(principal, userID, collectionId, recordId, resourceId)
        return ResponseEntity.ok().build()
    }

    override fun getResourceById(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String?
    ): ResponseEntity<JsonNode> {
        val resourceData = ogcResourceService.getResource(collectionId, recordId, resourceId)
        return ResponseEntity.ok().body(resourceData)
    }


}
