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

import de.ingrid.codelists.model.CodeList
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal

@Hidden
@Tag(name = "Codelist", description = "the codelist API")
interface CodelistApi {

    @Operation
    @RequestMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getAllCodelists(): ResponseEntity<List<CodeList>>

    @Operation
    @RequestMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.POST])
    fun updateCodelists(): ResponseEntity<List<CodeList>>

    @Operation
    @RequestMapping(value = ["/{ids}"], produces = [MediaType.APPLICATION_JSON_VALUE], method = [RequestMethod.GET])
    fun getCodelistsByIds(
        principal: Principal,
        @Parameter(description = "The ID of the codelists.", required = true) @PathVariable("ids") ids: List<String>,
    ): ResponseEntity<List<CodeList>>

    @Operation
    @GetMapping(value = ["/manage"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getCatalogCodelists(principal: Principal): ResponseEntity<List<CodeList>>

    @Operation
    @PutMapping(value = ["/manage/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun updateCatalogCodelist(
        principal: Principal,
        @Parameter() @PathVariable id: String,
        @Parameter() @RequestBody codelist: Codelist,
    ): ResponseEntity<Codelist>

    @Operation
    @DeleteMapping(value = ["/manage/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun resetCatalogCodelist(
        principal: Principal,
        @Parameter() @PathVariable id: String?,
    ): ResponseEntity<List<CodeList>>

    @Operation
    @PostMapping(value = ["/favorites/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun updateFavorites(
        principal: Principal,
        @Parameter() @PathVariable id: String,
        @Parameter() @RequestBody favorites: List<String>?,
    ): ResponseEntity<Unit>
}
