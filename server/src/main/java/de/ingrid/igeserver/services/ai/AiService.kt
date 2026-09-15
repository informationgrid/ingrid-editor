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

import com.aallam.openai.api.chat.ChatCompletion
import com.aallam.openai.api.chat.ChatCompletionRequest
import com.aallam.openai.api.chat.ChatMessage
import com.aallam.openai.api.chat.ChatResponseFormat
import com.aallam.openai.api.chat.ChatRole
import com.aallam.openai.api.chat.Effort
import com.aallam.openai.api.chat.JsonSchema
import com.aallam.openai.api.http.Timeout
import com.aallam.openai.api.logging.Logger
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.LoggingConfig
import com.aallam.openai.client.OpenAI
import com.aallam.openai.client.OpenAIHost
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.model.AiSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import de.ingrid.igeserver.services.DocumentService
import org.springframework.stereotype.Service
import tools.jackson.core.type.TypeReference
import tools.jackson.module.kotlin.jacksonObjectMapper
import kotlin.time.Duration.Companion.seconds

@Service
class AiService(
    private val generalProperties: GeneralProperties,
    private val settingsRepo: SettingsRepository,
    private val documentService: DocumentService,
    private val promptProvider: AiPromptProvider,
    private val schemaProvider: AiJsonSchemaProvider,
) {
    // TODO: this is just a temporary way to store the evaluation results.
    var evaluateResults: String? = null

    fun updateSettings(settings: AiSettings): AiSettings {
        val aiSettings = getSettings() ?: settings
        aiSettings.apply {
            if (settings.hostUrl.isNullOrEmpty()) {
                // Reset api token if the host url is not given.
                apiToken = null
            } else if (!settings.apiToken.isNullOrEmpty()) {
                // Only set api token if it is given.
                apiToken = settings.apiToken
            }
            hostUrl = settings.hostUrl?.takeIf { it.isNotEmpty() }
            modelId = settings.modelId?.takeIf { it.isNotEmpty() }
            systemPrompt = settings.systemPrompt?.takeIf { it.isNotEmpty() }
            effort = settings.effort?.takeIf { it.isNotEmpty() }
        }

        val dbSettings = settingsRepo.findByKey("aiSettings") ?: Settings().apply { this.key = "aiSettings" }
        dbSettings.value = aiSettings
        settingsRepo.save(dbSettings)
        return aiSettings
    }

    fun getSettingsWithoutToken(): AiSettings? = getSettings()?.copy(apiToken = null)

    private fun getSettings(): AiSettings? {
        val jsonValue = settingsRepo.findByKey("aiSettings")?.value ?: return null
        return jacksonObjectMapper().convertValue(jsonValue, object : TypeReference<AiSettings>() {})
    }

    suspend fun evaluate(body: String): String? {
        val (openAI, modelId, effort) = getOpenAIClient()

        val chatCompletionRequest = buildChatRequest(
            modelId = modelId,
            effort = effort,
            systemPrompt = getSettings()?.systemPrompt ?: promptProvider.getEvaluatePrompt(),
            userPrompt = body,
            jsonSchema = schemaProvider.getEvaluateResponseSchema(),
        )

        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)
        val result = completion.choices.firstOrNull()?.message?.content

        // TODO: temporarily append result to evaluateResults.
        if (result != null) {
            val results = jacksonObjectMapper().run {
                writeValueAsString(createObjectNode().set("data", createArrayNode().add(readTree(result))))
            }
            appendResults(results)
        }

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

        // Submit all documents for evaluation.
        val (openAI, modelId, effort) = getOpenAIClient()
        val chatCompletionRequest = buildChatRequest(
            modelId = modelId,
            effort = effort,
            systemPrompt = promptProvider.getEvaluateAllPrompt(
                getSettings()?.systemPrompt ?: promptProvider.getEvaluatePrompt(),
            ),
            userPrompt = documentsInJson,
            jsonSchema = schemaProvider.getEvaluateAllResponseSchema(),
        )
        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)

        // Append results to evaluateResults.
        val results = completion.choices.firstOrNull()?.message?.content
        appendResults(results)

        return evaluateResults
    }

    private fun appendResults(results: String?) {
        if (results == null) return
        val mapper = jacksonObjectMapper()
        val seenUuids = mutableSetOf<String>()

        val combinedData = listOfNotNull(results, evaluateResults)
            .flatMap { mapper.readTree(it)?.get("data")?.toList().orEmpty() }
            .filter { node -> node.get("uuid")?.asString()?.let { seenUuids.add(it) } != false }
            .fold(mapper.createArrayNode()) { arr, node -> arr.add(node) }

        evaluateResults = combinedData.takeUnless { it.isEmpty }
            ?.let { mapper.writeValueAsString(mapper.createObjectNode().set("data", it)) }
    }

    private fun getOpenAIClient(): Triple<OpenAI, String, String?> {
        val settings = getSettings()
        val hostUrl = settings?.hostUrl ?: generalProperties.openAIHost
        val apiToken = settings?.apiToken ?: generalProperties.openAIToken
        val modelId = settings?.modelId ?: generalProperties.openAIModel
        val effort = settings?.effort

        if (apiToken.isNullOrEmpty()) {
            throw ServerException.withReason("No OpenAI-Token configured")
        }

        val openAI = OpenAI(
            host = OpenAIHost(baseUrl = hostUrl),
            token = apiToken,
            timeout = Timeout(socket = 600.seconds),
            logging = LoggingConfig(logger = Logger.Empty),
        )

        return Triple(openAI, modelId, effort)
    }

    private fun buildChatRequest(
        modelId: String,
        effort: String?,
        systemPrompt: String,
        userPrompt: String,
        jsonSchema: JsonSchema,
    ): ChatCompletionRequest = ChatCompletionRequest(
        model = ModelId(modelId),
        reasoningEffort = effort?.let { Effort(it) },
        messages = listOf(
            ChatMessage(
                role = ChatRole.System,
                content = systemPrompt,
            ),
            ChatMessage(
                role = ChatRole.User,
                content = userPrompt,
            ),
        ),
        responseFormat = ChatResponseFormat.jsonSchema(
            jsonSchema,
        ),
    )
}
