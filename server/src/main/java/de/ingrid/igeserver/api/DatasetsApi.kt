package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.CopyOptions
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.util.*

@Tag(name = "Datasets", description = "the datasets API")
interface DatasetsApi {

    @PostMapping(value = ["/datasets"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Create a complete dataset")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "200", description = "Unexpected error")]
    )
    fun createDataset(
        principal: Principal,
        @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid JsonNode,
        @Parameter(description = "Is this an address document") @RequestParam(required = false) address: @Valid Boolean,
        @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(
            value = "publish",
            required = false
        ) publish: Boolean
    ): ResponseEntity<JsonNode>

    @PutMapping(value = ["/datasets/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Update a complete dataset")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "200", description = "Unexpected error")]
    )
    fun updateDataset(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int,
        @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: @Valid JsonNode,
        @Parameter(description = "If we want to delay the publication set this date.") @RequestParam(
            value = "publishDate",
            required = false
        ) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) publishDate: Date?,
        @Parameter(description = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(
            value = "publish",
            required = false
        ) publish: Boolean,
        @Parameter(description = "If we want to unpublish a document then this parameter has to be set to true.") @RequestParam(
            value = "unpublish",
            required = false
        ) unpublish: Boolean,
        @Parameter(description = "If we want to cancel the delayed publishing of a document then this parameter has to be set to true.") @RequestParam(
            value = "cancelPendingPublishing",
            required = false
        ) cancelPendingPublishing: Boolean,
        @Parameter(description = "Delete the draft version and make the published version the current one.") @RequestParam(
            value = "revert",
            required = false
        ) revert: Boolean
    ): ResponseEntity<JsonNode>

    @Operation(description = "Copy a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been copied successfully.")])
    @RequestMapping(
        value = ["/datasets/{ids}/copy"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.POST]
    )
    fun copyDatasets(
        principal: Principal,
        @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<Int>,
        @Parameter(description = "...", required = true) @RequestBody options: @Valid CopyOptions
    ): ResponseEntity<List<JsonNode>>

    @Operation(description = "Deletes a dataset")
    @ApiResponses(
        value = [ApiResponse(responseCode = "204"), ApiResponse(
            responseCode = "500",
            description = "Unexpected error"
        )]
    )
    @RequestMapping(
        value = ["/datasets/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.DELETE]
    )
    fun deleteById(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") ids: List<Int>
    ): ResponseEntity<Unit>

    @Operation(description = "Get child datasets of a given parent document/folder")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Child Datasets found")])
    @RequestMapping(
        value = ["/tree/children"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.GET]
    )
    fun getChildren(
        principal: Principal,
        @Parameter(description = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.") @RequestParam(
            value = "parentId",
            required = false
        ) parentId: String?,
        @Parameter(description = "Define if we want to have addresses or documents.") @RequestParam(
            value = "address",
            required = false
        ) isAddress: Boolean
    ): ResponseEntity<List<JsonNode>>

    @Operation(description = "Retrieve a dataset by a given ID.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The dataset with the given ID."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @RequestMapping(
        value = ["/datasets/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.GET]
    )
    fun getByID(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int,
        /*@Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(
            value = "publish",
            required = false
        ) publish: Boolean?*/
    ): ResponseEntity<JsonNode>

    @Operation(description = "Retrieve a dataset by a given UUID.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The dataset with the given ID."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @RequestMapping(
        value = ["/datasetsByUuid/{uuid}"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.GET]
    )
    fun getByUUID(
        principal: Principal,
        @Parameter(description = "The UUID of the dataset.", required = true) @PathVariable("uuid") uuid: String,
        @Parameter(description = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(
            value = "publish",
            required = false
        ) publish: Boolean?
    ): ResponseEntity<JsonNode>

    @Operation(description = "Get the hierarchical path of a document. Retrieve an array of ID of all parents leading to the given dataset ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Array of IDs.")])
    @RequestMapping(
        value = ["/datasets/{id}/path"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.GET]
    )
    fun getPath(
        principal: Principal,
        @Parameter(description = "The ID of the dataset.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<List<DatasetsApiController.PathResponse>>

    @Operation(description = "Move a dataset or tree under another dataset")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets have been moved successfully.")])
    @RequestMapping(
        value = ["/datasets/{ids}/move"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.POST]
    )
    fun moveDatasets(
        principal: Principal,
        @Parameter(description = "IDs of the copied datasets", required = true) @PathVariable("ids") ids: List<Int>,
        @Parameter(description = "...", required = true) @RequestBody options: @Valid CopyOptions
    ): ResponseEntity<Void>

    @Operation(description = "Replace address references from all documents")
    @PostMapping(value = ["/datasets/{source}/replaceAddress/{target}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun replaceAddress(
        principal: Principal,
        @PathVariable source: String,
        @PathVariable target: String
    ): ResponseEntity<Unit>

    @Operation(description = "Get all users with access to the document")
    @PostMapping(value = ["/datasets/{id}/users"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getUsersWithAccessToDocument(
        principal: Principal,
        @PathVariable id: Int,
    ): ResponseEntity<DatasetsApiController.UserAccessResponse>

    @Operation
    @PutMapping(value = ["/datasets/{id}/tags"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setTags(
        principal: Principal,
        @PathVariable id: Int,
        @RequestBody tags: TagRequest
    ): ResponseEntity<Array<String>>
}

data class TagRequest(val add: List<String>?, val remove: List<String>?)