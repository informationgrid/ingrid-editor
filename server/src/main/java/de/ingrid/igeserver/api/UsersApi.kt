/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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

import de.ingrid.igeserver.model.CatalogAdmin
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.model.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
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
@Tag(name = "Users", description = "the users API")
interface UsersApi {
    @PostMapping(
        value = ["/users"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Create a new user. If the user already exists an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "User was successfully updated"
        ), ApiResponse(
            responseCode = "400",
            description = "A user with the given login does not exist and cannot be updated"
        )]
    )
    fun createUser(
        principal: Principal,
        @Parameter(
            description = "Save the user data into the database.",
            required = true
        ) @RequestBody user: @Valid User,
        @Parameter(description = "With this option an external user is tried to be created")
        @RequestParam(value = "newExternalUser", required = false) newExternalUser: Boolean = false
    ): ResponseEntity<User>

    @DeleteMapping(
        value = ["/users/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "The user with the given ID is deleted. If user with a given login does not exists an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "User was successfully deleted"
        ), ApiResponse(
            responseCode = "400",
            description = "A user with the given login does not exist and cannot be deleted"
        )]
    )
    fun deleteUser(
        principal: Principal,
        @Parameter(description = "The ID of the user.", required = true) @PathVariable("id") userId: Int
    ): ResponseEntity<Void>

    @GetMapping(
        value = ["/users/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Get the user with the given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the user")])
    fun getUser(
        principal: Principal,
        @Parameter(description = "The ID of the user.", required = true) @PathVariable("id") userId: Int
    ): ResponseEntity<User>

    @GetMapping(
        value = ["/users/{id}/fullname"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Get the full name of the user with the given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the name")])
    fun getFullName(
        principal: Principal,
        @Parameter(description = "The ID of the user.", required = true) @PathVariable("id") userId: Int
    ): ResponseEntity<String>

    @GetMapping(value = ["/users"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Returns the list of users registered in IGE"
        )]
    )
    fun list(
        principal: Principal
    ): ResponseEntity<List<User>>


    @GetMapping(
        value = ["/users/{id}/responsibilities"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Get all datasets the user is responsible for.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the dataset ids")])
    fun getResponsibilities(
        principal: Principal,
        @Parameter(description = "The ID of the user.", required = true) @PathVariable("id") userId: Int
    ): ResponseEntity<List<Int>>


    @GetMapping(
        value = ["/users/transferResponsibilities/{oldUserId}/{newUserId}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Reassign all datasets from one user to another.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets successfully reassigned")])
    fun reassignResponsibilities(
        principal: Principal,
        @Parameter(description = "The ID of the user currently having the responsibility.", required = true) @PathVariable("oldUserId") oldUserId: Int,
        @Parameter(description = "The ID of the user receiving the responsibility.", required = true) @PathVariable("newUserId") newUserId: Int
    ): ResponseEntity<Void>

    @GetMapping(
        value = ["/users/admins/{catalogId}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Returns the list of users who are Catalog-Admins for a specific Catalog"
        )]
    )
    fun listCatAdmins(@Parameter(description = "Id of the catalog.", required = true) @PathVariable("catalogId") catalogId: String,
    ): ResponseEntity<List<User>>

    @PutMapping(
        value = ["/users"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Updates an existing user user. If the user does not exist an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "User was successfully created"
        ), ApiResponse(responseCode = "400", description = "A user already exists with the given login")]
    )
    fun updateUser(
        principal: Principal,
        @Parameter(
            description = "Save the user data into the database.",
            required = true
        ) @RequestBody user: @Valid User
    ): ResponseEntity<Void>

    @PutMapping(
        value = ["/users/currentUser"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(description = "Updates the current user with the given values. If the user does not exist an error will be returned.")
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "User was successfully updated"
        )]
    )
    fun updateCurrentUser(
        principal: Principal,
        @Parameter(
            description = "Partial or complete Userdata. Empty fields will be ignored",
            required = true
        ) @RequestBody user: User
    ): ResponseEntity<Void>

    @GetMapping(
        value = ["/info/currentUser"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "400",
            description = ""
        )]
    )
    fun currentUserInfo(principal: Principal): ResponseEntity<UserInfo>

    @PostMapping(
        value = ["/info/setCatalogAdmin"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(
            responseCode = "400",
            description = ""
        )]
    )
    fun setCatalogAdmin(
        principal: Principal,
        @Parameter(
            description = "Save the user data into the database.",
            required = true
        ) @RequestBody info: @Valid CatalogAdmin
    ): ResponseEntity<UserInfo?>

    @GetMapping(
        value = ["/info/assignedUsers/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun assignedUsers(
        principal: Principal,
        @Parameter(
            description = "The catalog id to query the assigned users from.",
            required = true
        ) @PathVariable("id") id: String
    ): ResponseEntity<List<String>>

    @PostMapping(value = ["/user/catalog/{catalogId}"])
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun switchCatalog(
        principal: Principal,
        @Parameter(
            description = "The id of the catalog to switch to for the current user",
            required = true
        ) @PathVariable("catalogId") catalogId: String
    ): ResponseEntity<Catalog>

    @GetMapping(value = ["/info/refreshSession"])
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    fun refreshSession(): ResponseEntity<Void>

    @RequestMapping(
        value = ["/externalUsers"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        method = [RequestMethod.GET]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Returns the list of external users (keycloak)"
        )]
    )
    fun listExternal(principal: Principal): ResponseEntity<List<User>>

    @PostMapping(
        value = ["/externalUsers/requestPasswordChange/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Sends an email to a user for changing its password"
        )]
    )
    fun requestPasswordChange(
        principal: Principal,
        @Parameter(
            description = "The user login the password change request shall be initiated.",
            required = true
        ) @PathVariable("id") id: String
    ): ResponseEntity<Void>

    @PostMapping(
        value = ["/externalUsers/resetPassword/{id}"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Sends an email to a user for changing its password"
        )]
    )
    fun resetPassword(
        principal: Principal,
        @Parameter(
            description = "The user login of which the password shall be reset.",
            required = true
        ) @PathVariable("id") id: String
    ): ResponseEntity<Void>


    @GetMapping(
        value = ["/internalUsers"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Returns the list of all registered user ids"
        )]
    )
    fun listInternal(principal: Principal): ResponseEntity<List<String>>

    @PostMapping(
        value = ["/user/{userId}/assignCatalog"],
    )
    @Operation
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Assign catalog to user"
        )]
    )
    fun assignUserToCatalog(
        principal: Principal, @Parameter(
            description = "The user login of which the catalog will be assigned.",
            required = true
        ) @PathVariable("userId") userId: String, @Parameter(
            description = "The catalogId to assign",
            required = true
        ) @RequestBody catalogId: @Valid String
    ): ResponseEntity<Void>
}
