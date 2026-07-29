/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services.ai

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.AiSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ai.model.AssistantOptions
import de.ingrid.igeserver.services.ai.model.EvaluationResult
import de.ingrid.igeserver.services.ai.model.buildAssistant
import net.sf.ehcache.util.concurrent.ConcurrentHashMap
import org.springframework.stereotype.Service

@Service
class AiService(
    private val settingsRepo: SettingsRepository,
    private val documentService: DocumentService,
) {
    // TODO: this is just a temporary way to store the evaluation results.
    var evaluateResults: String? = null

    private val cachedEvaluations = ConcurrentHashMap<String, EvaluationResult>()

    fun updateSettings(settings: AiSettings): AiSettings {
        val aiSettings = getSettings() ?: settings
        aiSettings.apply {
            if (settings.hostUrl.isNullOrEmpty()) {
                // Reset api token if the host url is not given.
                apiKey = null
            } else if (!settings.apiKey.isNullOrEmpty()) {
                // Only set api token if it is given.
                apiKey = settings.apiKey
            }
            hostUrl = settings.hostUrl?.takeIf { it.isNotEmpty() }
            modelId = settings.modelId?.takeIf { it.isNotEmpty() }
            instruction = settings.instruction?.takeIf { it.isNotEmpty() }
            mcpServers = settings.mcpServers?.takeIf { it.isNotEmpty() }
        }

        val dbSettings = settingsRepo.findByKey("aiSettings") ?: Settings().apply { this.key = "aiSettings" }
        dbSettings.value = aiSettings
        settingsRepo.save(dbSettings)
        return aiSettings
    }

    fun getSettingsWithoutToken(): AiSettings? = getSettings()?.copy(apiKey = null)

    // Evaluate the dataset by the given uuid.
    suspend fun evaluate(uuid: String): EvaluationResult? {
        val options = getAssistantOptions(uuid).takeIf { it != null } ?: return null
        val assistant = options.buildAssistant()
        val result = assistant.evaluate(uuid)

        // Store evaluations to the temporary cache.
        cachedEvaluations[uuid] = result

        return result
    }

    suspend fun evaluateAll(catalogId: String, limit: Int = 10): String? {
        // Get published documents and convert into JSON string.
        val documents = documentService.getPublishedInGridGeoDatasets(catalogId).shuffled().take(limit)
        val documentsInJson = documents.map { document ->
            val data = document.data.deepCopy()
            data.put("uuid", document.uuid)
            data.put("title", document.title)
            jacksonObjectMapper().writeValueAsString(data)
        }.toString()

        return ""
    }

    suspend fun getCachedEvaluations(): List<EvaluationResult> = cachedEvaluations.values.toList()

    // Get current settings.
    private fun getSettings(): AiSettings? {
        val jsonValue = settingsRepo.findByKey("aiSettings")?.value ?: return null
        return jacksonObjectMapper().convertValue(jsonValue, object : TypeReference<AiSettings>() {})
    }

    // Get AssistantOptions by the current settings.
    private fun getAssistantOptions(input: String): AssistantOptions? {
        val settings = getSettings() ?: return null

        // Return null if any necessary values are not present.
        val clientUrl = settings.hostUrl?.takeIf { it.isNotEmpty() } ?: return null
        val modelId = settings.modelId?.takeIf { it.isNotEmpty() } ?: return null
        val apiKey = settings.apiKey?.takeIf { it.isNotEmpty() } ?: return null

        return AssistantOptions(
            clientUrl = clientUrl,
            modelId = modelId,
            apiKey = apiKey,
            mcpServers = settings.mcpServers,
            instruction = settings.instruction,
            input = input,
        )
    }
}
