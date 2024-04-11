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

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.MediaType
import jakarta.ws.rs.core.MediaType as JakartaMediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody

interface OgcDistributionsApi {

    @PostMapping("/collections/{collectionId}/items/{recordId}/distributions", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]) //"multipart/form-data",
    @Operation(tags=["OGC/Distributions"], responses = [], summary = "Upload distributions (files) to a specific collection and record", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Distributions uploaded successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun postDistribution(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "File the should be uploaded.", required = true) @RequestPart files: List<MultipartFile>,
    ): ResponseEntity<String>

    @DeleteMapping("/collections/{collectionId}/items/{recordId}/distributions")
    @Operation(tags=["OGC/Distributions"], responses = [], summary = "Delete an existing distribution (file)", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Distribution deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun deleteDistribution(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "## distribution ID \n\n The Identifier of the distribution.") @RequestParam(value = "uri", required = true) distributionId: String,
    ): ResponseEntity<String>

    @GetMapping("/collections/{collectionId}/items/{recordId}/distributions", produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(tags=["OGC/Distributions"], responses = [], summary = "Get information about distribution", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Distribution deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun getDistributionInformation(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "## Distribution ID \n\n The Identifier of a distribution. \n\n If no identifier is given, than it returns a list of all distributions of a record.") @RequestParam(value = "uri", required = false) distributionId: String?,
        @Parameter(description = "## Format: Response Encoding: \n **Custom Parameter** \n\n ### Supported formats: \n\n• get response in JSON with value `json` (default) \n\n• get response in HTML with value `html`")
        @RequestParam(value = "f", required = false, defaultValue = "json") format: String?,
    ): ResponseEntity<ByteArray>

    @GetMapping("/collections/{collectionId}/items/{recordId}/distributions/download", produces = [JakartaMediaType.APPLICATION_OCTET_STREAM])
    @Operation(tags=["OGC/Distributions"], responses = [], summary = "Download distribution file", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Distribution deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun getDistributionDownload(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "## Distribution ID \n\n The Identifier of the distribution.") @RequestParam(value = "uri", required = true) distributionId: String,
    ): ResponseEntity<StreamingResponseBody>

}