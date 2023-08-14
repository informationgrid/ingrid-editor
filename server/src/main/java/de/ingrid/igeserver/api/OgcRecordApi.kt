package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.RecordCollection
import de.ingrid.igeserver.model.RecordOverview
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import java.util.*


@Tag(name = "OgcRecord", description = "Test API in OGC context")
interface OgcRecordApi {


    @GetMapping(value = ["/collections"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get all Catalogs")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun catalogs(principal: Principal): ResponseEntity<List<RecordCollection>>



    @GetMapping(value = ["/collections/{collectionId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get Catalog by ID")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun catalogById(
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
    ): ResponseEntity<RecordCollection>



    @GetMapping(value = ["/collections/{collectionId}/items"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Get all Records of Catalog by ID")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun datasetsByCatalogId(
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @Valid @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The number of records to be presented in a response document.") @RequestParam(value = "limit", required = false) limit: Int?,
            @Parameter(description = "The number of records to be presented in a response document.") @RequestParam(value = "offset", required = false) offset: Int?,
            @Parameter(description = "Filter by Document Type") @RequestParam(value = "filter", required = false) filter: String?,
            // @Parameter(description = "A bounding box. If the spatial extent of the record intersects the specified bounding box then the record shall be presented in the response document.") @RequestParam(value = "bbox", required = false) bbox: String?,
            // @Parameter(description = "A time instance or time period. If the temporal extent of the record intersects the specified data/time value then the record shall be presented in the response document.") @RequestParam(value = "datetime", required = false) datetime: String?,
    ): ResponseEntity<List<RecordOverview>>



    @GetMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(responses = [], summary = "Get one Record by ID of Catalog by ID")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun datasetByRecordIdAndCatalogId(
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @Valid @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
            @Parameter(description = "The Response Format.") @RequestParam(value = "f", required = false) format: String?,
            @Parameter(description = "Request Draft Version.") @RequestParam(value = "draft", required = false) draft: Boolean?,
    ): ResponseEntity<ByteArray>



    @DeleteMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(responses = [], summary = "Delete Record by ID of Catalog by ID")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun deleteDatasetOfCatalog(
            principal: Principal,
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
    ): ResponseEntity<Void>



    @PostMapping(value = ["/collections/{collectionId}/items"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Import a complete dataset")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
        ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    fun createDataset(
            principal: Principal,
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid JsonNode,
            @Parameter(description = "Is this an address document") @RequestParam(required = false) address: @Valid Boolean,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean
    ): ResponseEntity<JsonNode>



    @PatchMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Update a record")
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
        ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    fun updateDataset(
            principal: Principal,
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
            @Parameter(description = "The data to be stored.", required = true) @RequestBody data: @Valid JsonNode,

            @Parameter(description = "If we want to delay the publication set this date.") @RequestParam(
                    value = "publishDate",
                    required = false
            ) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) publishDate: Date?,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(
                    value = "publish",
                    required = false
            ) publish: Boolean
    ): ResponseEntity<JsonNode>


}