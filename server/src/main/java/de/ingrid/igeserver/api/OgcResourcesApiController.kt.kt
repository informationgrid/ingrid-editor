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
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

@RestController
@Profile("ogc-resources-api")
@RequestMapping(path = ["/api/ogc"])
class OgcResourcesApiController(
    private val ogcResourceService: OgcResourceService,
): OgcResourcesApi {

    val log = logger()

    override fun postResource(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        files: List<MultipartFile>
    ): ResponseEntity<String> {
        val userID = principal.name
        ogcResourceService.handleUploadResource(principal, userID, collectionId, recordId, files)
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
        ogcResourceService.handleDeleteResource(principal, userID, collectionId, recordId, resourceId)
        return ResponseEntity.ok().build()
    }

    override fun getResourceInformation(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String?
    ): ResponseEntity<JsonNode> {
        val host = allHeaders["host"]?:""
        val baseUrl = if ( host.contains("localhost") ) "http://$host" else "https://$host"

        val resourceInformation = ogcResourceService.getResource(baseUrl, collectionId, recordId, resourceId)
        return ResponseEntity.ok().body(resourceInformation)
    }

    override fun getResourceDownload(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        resourceId: String
    ): ResponseEntity<StreamingResponseBody> {
        val userID = principal.name
        val fileStream = ogcResourceService.handleResourceDownload(collectionId, recordId, resourceId, userID)
        return ResponseEntity.ok().header("Content-Disposition", "attachment; filename=\"${resourceId}\"").body(fileStream)
    }


}
