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
import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.model.AiSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import org.springframework.stereotype.Service
import kotlin.time.Duration.Companion.seconds

@Service
class AiService(
    private val generalProperties: GeneralProperties,
    private val settingsRepo: SettingsRepository,
    private val promptProvider: AiPromptProvider,
    private val schemaProvider: AiJsonSchemaProvider,
) {
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
            systemPrompt = getSettings()?.systemPrompt ?: promptProvider.getEvaluateSystemPrompt(),
            userPrompt = body,
            jsonSchema = schemaProvider.getEvaluateResponseSchema(),
        )

        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)
        return completion.choices.firstOrNull()?.message?.content
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
    ): ChatCompletionRequest {
        return ChatCompletionRequest(
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
                jsonSchema
            ),
        )
    }
}