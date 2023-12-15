/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import de.ingrid.igeserver.model.CopyOptions
import io.swagger.v3.oas.annotations.Hidden
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

@Hidden
@Tag(name = "Datasets", description = "the datasets API")
interface DatasetsApi {

    @PostMapping(value = ["/datasets"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Create a complete dataset")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
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



    @Operation(description = "Set the responsible user for a dataset")
    @PostMapping(value = ["/datasets/{datasetId}/responsibleUser/{userId}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setResponsibleUser(
        principal: Principal,
        @PathVariable datasetId: Int,
        @PathVariable userId: Int,
    ): ResponseEntity<Void>

    @Operation
    @PutMapping(value = ["/datasets/{id}/tags"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setTags(
        principal: Principal,
        @PathVariable id: Int,
        @RequestBody tags: TagRequest
    ): ResponseEntity<List<String>>

    @Operation
    @PostMapping(value = ["/datasets/{id}/validate"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun validate(
        principal: Principal,
        @PathVariable id: Int,
    ): ResponseEntity<Unit>
}

data class TagRequest(val add: List<String>?, val remove: List<String>?)
