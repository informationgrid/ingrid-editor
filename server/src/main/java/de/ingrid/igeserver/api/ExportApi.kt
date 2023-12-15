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

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import java.security.Principal

@Hidden
@Tag(name = "Export", description = "the export API")
interface ExportApi {
    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The stored dataset, which might contain additional storage information."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @PostMapping(value = ["/export"], produces = ["application/zip"])
    fun export(
        principal: Principal,
        @Parameter(
            description = "The dataset to be exported.",
            required = true
        ) @RequestBody data: @Valid ExportRequestParameter
    ): ResponseEntity<ByteArray?>

    @ApiResponses(
        value = [ApiResponse(
            responseCode = "200",
            description = "The supported types for export."
        ), ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    @GetMapping(value = ["/export"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun exportTypes(
        principal: Principal,
        @Parameter(description = "The catalog profile to get the supported export types from.") @RequestParam(value = "profile") profile: String
    ): ResponseEntity<List<ExportTypeInfo>>
}