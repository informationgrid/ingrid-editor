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


import de.ingrid.igeserver.model.Message
import de.ingrid.igeserver.model.MessageCreationRequest
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Hidden
@Tag(name = "Messages", description = "the messages API")
interface MessagesApi {
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The messages for the current catalog are returned."
        )]
    )
    @GetMapping(value = ["/messages"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getMessages(principal: Principal): ResponseEntity<List<Message>>

    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "All messages are returned."
        )]
    )
    @GetMapping(value = ["/dbMessages"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getDbMessages(principal: Principal): ResponseEntity<List<de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message>>


    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Create a new message."
        )]
    )
    @PostMapping(value = ["/messages"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun createMessage(principal: Principal, @Parameter(required = true) @RequestBody messageRequest: MessageCreationRequest): ResponseEntity<Void>

    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "Delete a message."
        )]
    )
    @DeleteMapping(value = ["/messages/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun deleteMessage(principal: Principal, @Parameter() @PathVariable id: Int): ResponseEntity<Void>

}
