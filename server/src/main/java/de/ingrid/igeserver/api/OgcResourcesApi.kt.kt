package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

interface OgcResourcesApi {

    @PostMapping("/collections/{collectionId}/items/{recordId}/resources", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE]) //"multipart/form-data",
    @Operation(tags=["OGC/resources"], responses = [], summary = "Upload a resource to a specific collection and record", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Resource uploaded successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun postResource(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "Properties of a file (json object).", required = true) @RequestParam properties: String,
        @Parameter(description = "File the should be uploaded.", required = true) @RequestParam("files") files: List<MultipartFile>,
    ): ResponseEntity<String>

    @DeleteMapping("/collections/{collectionId}/items/{recordId}/resources")
    @Operation(tags=["OGC/resources"], responses = [], summary = "Delete an existing resource", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Resource deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun deleteResource(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
//        @Parameter(description = "## Resource ID \n\n The Identifier of the resource." , required = true) @PathVariable("resourceId") resourceId: String
        @Parameter(description = "## Resource ID \n\n The Identifier of the resource.") @RequestParam(value = "uri", required = true) resourceId: String,
    ): ResponseEntity<String>

    @GetMapping("/collections/{collectionId}/items/{recordId}/resources")
    @Operation(tags=["OGC/resources"], responses = [], summary = "Get a resource by ID", hidden = false )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Resource deleted successfully"),
        ApiResponse(responseCode = "400", description = "Invalid request")
    ])
    fun getResourceById(
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "## Record ID \n **OGC Parameter** \n\n The identifier for a specific record (i.e. record identifier).", required = true) @PathVariable("recordId") recordId: String,
        @Parameter(description = "## Resource ID \n\n The Identifier of the resource.") @RequestParam(value = "uri", required = false) resourceId: String?,
    ): ResponseEntity<JsonNode>

}