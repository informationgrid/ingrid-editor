/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.model.UserResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.FrontendGroup
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Hidden
@Tag(name = "Groups", description = "the groups API")
interface GroupsApi {
    @Operation(description = "Creates a new group. If group with a given login already exists an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Group was successfully updated"
        ), ApiResponse(
            responseCode = "400",
            description = "A group with the given login does not exist and cannot be updated"
        )]
    )
    @PostMapping(
        value = ["/groups"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun createGroup(
        principal: Principal,
        @Parameter(description = "Save the group into the database.", required = true) @RequestBody group: @Valid Group
    ): ResponseEntity<Group>

    @Operation(description = "Delete a group with a given ID. If group with a given id does not exists an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Group was successfully deleted"
        ), ApiResponse(
            responseCode = "400",
            description = "A group with the given id does not exist and cannot be deleted"
        )]
    )
    @DeleteMapping(
        value = ["/groups/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun deleteGroup(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<Void>

    @Operation(description = "Get the group with the given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the group")])
    @GetMapping(
        value = ["/groups/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getGroup(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<FrontendGroup>

    @Operation(description = "")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the list of groups")])
    @GetMapping(value = ["/groups"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun listGroups(principal: Principal): ResponseEntity<List<FrontendGroup>>

    @Operation(description = "Updates a group. If group could not be found an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Group was successfully created"
        ), ApiResponse(responseCode = "400", description = "A group already exists with the given login")]
    )
    @PutMapping(
        value = ["/groups/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun updateGroup(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int,
        @Parameter(description = "Save the group into the database.", required = true) @RequestBody group: @Valid Group
    ): ResponseEntity<Group>

    @Operation(description = "Updates a group. If group could not be found an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Group was successfully created"
        ), ApiResponse(responseCode = "400", description = "A group already exists with the given login")]
    )
    @GetMapping(
        value = ["/groups/{id}/users"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getUsersOfGroup(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<List<UserResponse>>

    @GetMapping(
        value = ["/groups/{id}/manager"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun getManagerOfGroup(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int
    ): ResponseEntity<User>

    @PostMapping(
        value = ["/groups/{id}/manager"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    fun updateManager(
        principal: Principal,
        @Parameter(description = "The unique id of the group.", required = true) @PathVariable("id") id: Int,
        @Parameter(description = "The id of the manager", required = true) @RequestBody userId: String
    ): ResponseEntity<Group>
}
