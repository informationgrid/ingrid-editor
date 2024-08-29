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

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.model.IndexCronOptions
import de.ingrid.igeserver.model.IndexOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ExportConfig
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
@Tag(name = "Index", description = "the Indexing API")
interface IndexApi {
    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @PostMapping(value = ["/index/config/cron"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setConfig(
        principal: Principal,
        @Parameter(description = "The catalog ID and the cron pattern for which the configuration is saved", required = true)
        @RequestBody config: @Valid IndexCronOptions,
    ): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @PostMapping(value = ["/index/config/exports"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setExportConfig(
        principal: Principal,
        @Parameter(description = "The catalog ID and the cron pattern for which the configuration is saved", required = true)
        @RequestBody config: @Valid List<ExportConfig>,
    ): ResponseEntity<Void>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @GetMapping(value = ["/index/config"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getConfig(principal: Principal): ResponseEntity<IndexOptions>

    @Operation
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = ""), ApiResponse(responseCode = "500", description = "Unexpected error")])
    @GetMapping(value = ["/index/log"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getLog(principal: Principal): ResponseEntity<IndexMessage>
}
