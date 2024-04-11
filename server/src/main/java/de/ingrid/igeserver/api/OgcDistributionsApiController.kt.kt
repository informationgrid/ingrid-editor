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
import de.ingrid.igeserver.services.OgcDistributionsService
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
@Profile("ogc-distributions-api")
@RequestMapping(path = ["/api/ogc"])
class OgcDistributionsApiController(
    private val ogcDistributionsService: OgcDistributionsService,
    private val ogcHtmlConverterService: OgcHtmlConverterService
): OgcDistributionsApi {

    val log = logger()

    override fun postDistribution(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        files: List<MultipartFile>
    ): ResponseEntity<String> {
        val userID = principal.name
        ogcDistributionsService.handleUploadDistribution(principal, userID, collectionId, recordId, files)
        return ResponseEntity.ok().build()
    }

    override fun deleteDistribution(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        distributionId: String
    ): ResponseEntity<String> {
        val userID = principal.name
        ogcDistributionsService.handleDeleteDistribution(principal, userID, collectionId, recordId, distributionId)
        return ResponseEntity.ok().build()
    }

    override fun getDistributionInformation(
        allHeaders: Map<String, String>,
        principal: Authentication,
        collectionId: String,
        recordId: String,
        distributionId: String?,
        format: String?
    ): ResponseEntity<ByteArray> {
        val userID = principal.name
        val mimeType: String

        val host = allHeaders["host"]?:""
        val baseUrl = if ( host.contains("localhost") ) "http://$host" else "https://$host"

        val distributionInformation: JsonNode = ogcDistributionsService.getDistribution(baseUrl, collectionId, recordId, distributionId, userID)

        val response: Any = if (format == "html") {
            mimeType = MediaType.TEXT_HTML_VALUE
            val infoAsObjectNode = ogcDistributionsService.prepareForHtmlExport(distributionInformation)
            ogcHtmlConverterService.convertObjectNode2Html(infoAsObjectNode, "distributions")
        } else {
            mimeType = MediaType.APPLICATION_JSON_VALUE
            distributionInformation
        }

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(response.toString().toByteArray())
    }

}
