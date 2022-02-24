package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.SearchResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.util.*
import javax.validation.Valid

@Tag(name = "Datasets", description = "the datasets API")
interface DatasetsApi {

    @GetMapping(value = ["/datasets"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(description = "Get all datasets or those which match a given query. The results can also be sorted.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets found")])
    fun find(
            principal: Principal,
            @Parameter(description = "Find datasets by a search query.") @RequestParam(value = "query", required = false) query: String?,
            @Parameter(description = "Define the maximum number of returned documents.", allowEmptyValue = true) @RequestParam(value = "size", required = false) size: Int = 10,
            @Parameter(description = "Sort by a given field.") @RequestParam(value = "sort", required = false) sort: String?,
            @Parameter(description = "Define the sort order.") @RequestParam(value = "sortOrder", required = false, defaultValue = "ASC") sortOrder: String?,
            @Parameter(description = "Search in addresses.") @RequestParam(value = "address", required = false) forAddress: Boolean): ResponseEntity<SearchResult<JsonNode>>

    @PostMapping(value = ["/datasets"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Create a complete dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."), ApiResponse(responseCode = "200", description = "Unexpected error")])
    fun createDataset(
            principal: Principal,
            @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid JsonNode,
            @Parameter(description = "Is this an address document") @RequestParam(required = false) address: @Valid Boolean,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean): ResponseEntity<JsonNode>

    @PutMapping(value = ["/datasets/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Update a complete dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."), ApiResponse(responseCode = "200", description = "Unexpected error")])
    fun updateDataset(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int,
        @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid JsonNode,
        @Parameter(description = "If we want to delay the publification set this date.") @RequestParam(value = "publishDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) publishDate: Date?,
        @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean,
        @Parameter(description = "If we want to unpublish a document then this parameter has to be set to true.") @RequestParam(value = "unpublish", required = false) unpublish: Boolean,
        @Parameter(description = "If we want to cancel the delayed publishing of a document then this parameter has to be set to true.") @RequestParam(value = "cancelPendingPublishing", required = false) cancelPendingPublishing: Boolean,
        @Parameter(description = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", required = false) revert: Boolean): ResponseEntity<JsonNode>

    @Operation(description = "Copy a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been copied successfully.")])
    @RequestMapping(value = ["/datasets/{ids}/copy"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.POST])
    fun copyDatasets(
            principal: Principal,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<String>,
            @Parameter(description = "...", required = true) @RequestBody options: @Valid CopyOptions): ResponseEntity<List<JsonNode>>

    @Operation(description = "Deletes a dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "204"), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @RequestMapping(value = ["/datasets/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.DELETE])
    fun deleteById(
            principal: Principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") ids: Array<String>): ResponseEntity<Unit>

    @Operation(description = "Get child datasets of a given parent document/folder")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Child Datasets found")])
    @RequestMapping(value = ["/tree/children"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getChildren(
            principal: Principal,
            @Parameter(description = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.") @RequestParam(value = "parentId", required = false) parentId: String?,
            @Parameter(description = "Define if we want to have addresses or documents.") @RequestParam(value = "address", required = false) isAddress: Boolean): ResponseEntity<List<JsonNode>>

    @Operation(description = "Retrieve a dataset by a given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The dataset with the given ID."), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @RequestMapping(value = ["/datasets/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getByID(
            principal: Principal,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int,
            @Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean?): ResponseEntity<JsonNode>

    @Operation(description = "Retrieve a dataset by a given UUID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The dataset with the given ID."), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @RequestMapping(value = ["/datasetsByUuid/{uuid}"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getByUUID(
            principal: Principal,
            @Parameter(description = "The UUID of the dataset.", required = true) @PathVariable("uuid") uuid: String,
            @Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean?): ResponseEntity<JsonNode>

    @Operation(description = "Get the hierarchical path of a document. Retrieve an array of ID of all parents leading to the given dataset ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Array of IDs.")])
    @RequestMapping(value = ["/datasets/{id}/path"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getPath(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<List<DatasetsApiController.PathResponse>>

    @Operation(description = "Move a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been moved successfully.")])
    @RequestMapping(value = ["/datasets/{ids}/move"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.POST])
    fun moveDatasets(
            principal: Principal,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<Int>,
            @Parameter(description = "...", required = true) @RequestBody options: @Valid CopyOptions): ResponseEntity<Void>
}
