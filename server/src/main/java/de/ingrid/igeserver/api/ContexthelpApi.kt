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

import de.ingrid.igeserver.model.HelpMessage
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestMethod
import org.springframework.web.bind.annotation.RequestParam

@Hidden
@Tag(name = "Contexthelp", description = "the contexthelp API")
interface ContexthelpApi {
    @Operation(description = "Get the contexthelp text for a given ID.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the role")])
    @RequestMapping(value = ["/contexthelp"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getContextHelpText(
            @Parameter(description = "The unique id of the field.", required = true) @RequestParam("fieldId") id: String,
            @Parameter(description = "The active profile.", required = true) @RequestParam("profile") profile: String,
            @Parameter(description = "The current document type.", required = true) @RequestParam("docType") docType: String): ResponseEntity<HelpMessage>

    @Operation(description = "Get all fields with contexthelptexts")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Returns the list of field ids with contexthelptexts")])
    @RequestMapping(value = ["/contexthelpIds"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun listContextHelpIds(
            @Parameter(description = "The active profile.", required = true) @RequestParam("profile") profile: String,
            @Parameter(description = "The current document type.", required = true) @RequestParam("docType") docType: String): ResponseEntity<List<String>>
}