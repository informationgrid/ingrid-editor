package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.Data1
import de.ingrid.igeserver.model.SearchResult
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import javax.validation.Valid

@Tag(name = "Datasets", description = "the datasets API")
interface DatasetsApi {

    @GetMapping(value = ["/datasets"], produces = ["application/json"])
    @Operation(description = "Get all datasets or those which match a given query. The results can also be sorted.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets found")])
    @Throws(Exception::class)
    fun find(
            principal: Principal?,
            @Parameter(description = "Find datasets by a search query.") @RequestParam(value = "query", required = false) query: String,
            @Parameter(description = "Define the maximum number of returned documents.", allowEmptyValue = true) @RequestParam(value = "size", required = false) size: Int,
            @Parameter(description = "Sort by a given field.") @RequestParam(value = "sort", required = false) sort: String,
            @Parameter(description = "Define the sort order.") @RequestParam(value = "sortOrder", required = false, defaultValue = "ASC") sortOrder: String,
            @Parameter(description = "Search in addresses.") @RequestParam(value = "address", required = false) forAddress: Boolean): ResponseEntity<SearchResult>

    @PostMapping(value = ["/datasets"], produces = ["application/json"])
    @Operation(summary = "Create a complete dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."), ApiResponse(responseCode = "200", description = "Unexpected error")])
    @Throws(ApiException::class)
    fun createDataset(
            principal: Principal?,
            @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid String,
            @Parameter(description = "Is this an address document") @RequestParam(required = false) address: @Valid Boolean,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean): ResponseEntity<JsonNode>

    @PutMapping(value = ["/datasets/{id}"], produces = ["application/json"])
    @Operation(summary = "Update a complete dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."), ApiResponse(responseCode = "200", description = "Unexpected error")])
    @Throws(ApiException::class)
    fun updateDataset(
            principal: Principal?,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: String,
            @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid String,
            @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean,
            @Parameter(description = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", required = false) revert: Boolean): ResponseEntity<JsonNode>

    @Operation(description = "Copy a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been copied successfully.")])
    @RequestMapping(value = ["/datasets/{ids}/copy"], produces = ["application/json"], method = [RequestMethod.POST])
    fun copyDatasets(
            principal: Principal?,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<String>,
            @Parameter(description = "...", required = true) @RequestBody data: @Valid Data1): ResponseEntity<Void>

    @Operation(description = "Deletes a dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200"), ApiResponse(responseCode = "200", description = "Unexpected error")])
    @RequestMapping(value = ["/datasets/{id}"], produces = ["application/json"], method = [RequestMethod.DELETE])
    @Throws(Exception::class)
    fun deleteById(
            principal: Principal?,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") ids: Array<String>): ResponseEntity<String>

    @Operation(description = "Get child datasets of a given parent document/folder")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Child Datasets found")])
    @RequestMapping(value = ["/tree/children"], produces = ["application/json"], method = [RequestMethod.GET])
    @Throws(Exception::class)
    fun getChildren(
            principal: Principal?,
            @Parameter(description = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.") @RequestParam(value = "parentId", required = false) parentId: String?,
            @Parameter(description = "Define if we want to have addresses or documents.") @RequestParam(value = "address", required = false) isAddress: Boolean): ResponseEntity<List<ObjectNode>>

    @Operation(description = "Retrieve a dataset by a given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "The dataset with the given ID."), ApiResponse(responseCode = "200", description = "Unexpected error")])
    @RequestMapping(value = ["/datasets/{id}"], produces = ["application/json"], method = [RequestMethod.GET])
    @Throws(Exception::class)
    fun getByID(
            principal: Principal?,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: String,
            @Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) publish: Boolean?): ResponseEntity<JsonNode>

    @Operation(description = "Get the hierarchical path of a document. Retrieve an array of ID of all parents leading to the given dataset ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Array of IDs.")])
    @RequestMapping(value = ["/datasets/{id}/path"], produces = ["application/json"], method = [RequestMethod.GET])
    @Throws(ApiException::class)
    fun getPath(
            principal: Principal?,
            @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: String): ResponseEntity<List<String>>

    @Operation(description = "Move a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been moved successfully.")])
    @RequestMapping(value = ["/datasets/{ids}/move"], produces = ["application/json"], method = [RequestMethod.POST])
    @Throws(Exception::class)
    fun moveDatasets(
            principal: Principal?,
            @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<String>,
            @Parameter(description = "...", required = true) @RequestBody data: @Valid Data1): ResponseEntity<Void>
}