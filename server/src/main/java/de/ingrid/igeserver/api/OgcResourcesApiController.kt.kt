/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.ogc.OgcHtmlConverterService
import de.ingrid.igeserver.services.OgcResourceService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.MediaType
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpHeaders
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
    private val ogcHtmlConverterService: OgcHtmlConverterService
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
        resourceId: String?,
        format: String?
    ): ResponseEntity<ByteArray> {
        val userID = principal.name
        val mimeType: String

        val host = allHeaders["host"]?:""
        val baseUrl = if ( host.contains("localhost") ) "http://$host" else "https://$host"

        val resourceInformation: JsonNode = ogcResourceService.getResource(baseUrl, collectionId, recordId, resourceId, userID)

        val response: Any = if (format == "html") {
            mimeType = MediaType.TEXT_HTML_VALUE
            val infoAsObjectNode = ogcResourceService.prepareForHtmlExport(resourceInformation)
            ogcHtmlConverterService.convertObjectNode2Html(infoAsObjectNode, "Resources")
        } else {
            mimeType = MediaType.APPLICATION_JSON_VALUE
            resourceInformation
        }

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(response.toString().toByteArray())
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
