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
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ai.AiService
import de.ingrid.igeserver.services.ai.model.EvaluationResult
import kotlinx.coroutines.runBlocking
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping("/api")
class AiApiController(
    private val aiService: AiService,
    private val catalogService: CatalogService,
) : AiApi {

    override fun evaluate(
        principal: Principal,
        body: String,
    ): ResponseEntity<EvaluationResult> {
        val response = runBlocking { aiService.evaluate(body) }
        return ResponseEntity.ofNullable(response)
    }

    override fun evaluateAll(principal: Principal): ResponseEntity<String> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val response = runBlocking { aiService.evaluateAll(catalogId) }
        return ResponseEntity.ofNullable(response)
    }

    override fun getCachedEvaluations(principal: Principal): ResponseEntity<List<EvaluationResult>> {
        val response = runBlocking { aiService.getCachedEvaluations() }
        return ResponseEntity.ok(response)
    }

    override fun getSettings(principal: Principal): ResponseEntity<AiSettings> {
        val settings = aiService.getSettingsWithoutSecrets()
        return ResponseEntity.ofNullable(settings)
    }

    override fun updateSettings(principal: Principal, settings: AiSettings): ResponseEntity<AiSettings> {
        val updatedSettings = aiService.updateSettings(settings)
        return ResponseEntity.ok(updatedSettings)
    }
}
