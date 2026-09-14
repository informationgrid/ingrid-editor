/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.model.AiSettings
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import java.security.Principal

@Hidden
@Tag(name = "AI", description = "handle AI-related requests")
interface AiApi {

    @PostMapping(value = ["/ai/dataset/evaluate"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Evaluate dataset using AI")
    fun evaluate(
        principal: Principal,
        @RequestBody body: String,
    ): ResponseEntity<String>

    @PostMapping(value = ["/ai/dataset/evaluateAll"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Evaluate all datasets using AI")
    fun evaluateAll(
        principal: Principal,
    ): ResponseEntity<String>

    @GetMapping(value = ["/ai/dataset/latestReport"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Get the latest AI evaluation report")
    fun getEvaluateAllReport(
        principal: Principal,
    ): ResponseEntity<String>

    @GetMapping(value = ["/ai/settings"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Get AI settings")
    fun getSettings(
        principal: Principal,
    ): ResponseEntity<AiSettings>

    @PutMapping(value = ["/ai/settings"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(summary = "Update AI settings")
    fun updateSettings(
        principal: Principal,
        @RequestBody settings: AiSettings,
    ): ResponseEntity<AiSettings>
}
