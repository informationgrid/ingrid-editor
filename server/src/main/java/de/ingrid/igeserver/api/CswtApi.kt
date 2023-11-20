package de.ingrid.igeserver.api

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*

interface CswtApi {

    @PostMapping(value = ["{collectionId}"], consumes = [MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_XML_VALUE])
    @Operation(tags=["CSW-T"], summary = "Insert, Update, Delete Records via CSW-t", hidden = false)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation."),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
    ])
    fun handleCSWT(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier)." , required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "The datasets to be inserted, delete or updated.", required = true) @RequestBody data: String,
        @Parameter(description = "## Dataset Folder ID \n **Custom Parameter** \n\n Add Dataset to Folder with UUID") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
        @Parameter(description = "## Address Folder ID \n **Custom Parameter** \n\n Add Address to Folder with UUID") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
    ): ResponseEntity<ByteArray>

}