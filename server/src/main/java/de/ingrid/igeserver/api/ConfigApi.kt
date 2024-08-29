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

import de.ingrid.igeserver.model.CMSPage
import de.ingrid.igeserver.model.FrontendConfiguration
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ConnectionConfig
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody

@Hidden
@Tag(name = "Config", description = "the configs API")
interface ConfigApi {
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Frontend configuration")])
    @GetMapping(value = ["/config"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun get(): ResponseEntity<FrontendConfiguration>

    @GetMapping(value = ["/config/connections"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getConnections(): ResponseEntity<ConnectionConfig>

    @GetMapping(value = ["/config/connections/connected/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun isConnected(@PathVariable id: String): ResponseEntity<Boolean>

    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Settings have been set.")])
    @PutMapping(value = ["/config/connections"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun setConnections(@Parameter(required = true) @RequestBody config: ConnectionConfig): ResponseEntity<ConnectionConfig>

    @GetMapping(value = ["/config/cms"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getCMSPages(): ResponseEntity<List<LinkedHashMap<String, String>>>

    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Settings have been set.")])
    @PutMapping(value = ["/config/cms"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun updateCMS(
        @Parameter(required = true) @RequestBody pages: List<CMSPage>,
    ): ResponseEntity<Unit>
}
