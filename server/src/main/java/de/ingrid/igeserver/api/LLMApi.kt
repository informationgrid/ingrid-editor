/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import java.time.Instant

@Hidden
@Tag(name = "LLM", description = "Language Model API for processing text messages")
interface LLMApi {
    @Operation(
        summary = "Send a message to the LLM",
        description = "Processes a text message using the Language Model and returns the generated response"
    )
    @PostMapping(
        value = ["/message"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
        consumes = [MediaType.APPLICATION_JSON_VALUE]
    )
    @ApiResponse(
        responseCode = "200",
        description = "Message processed successfully"
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid message format"
    )
    fun processMessage(
        @Parameter(
            description = "Message to be processed by the LLM",
            required = true
        )
        @RequestBody
        request: LLMRequest
    ): LLMResponse
}

data class LLMRequest(
    val message: String
)

data class LLMResponse(
    val content: String,
    val timestamp: Instant = Instant.now()
)