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
package de.ingrid.igeserver.services.ai.model

import de.ingrid.igeserver.model.McpServer
import de.ingrid.igeserver.services.ai.ChatAssistant
import dev.langchain4j.mcp.McpToolProvider
import dev.langchain4j.mcp.client.DefaultMcpClient
import dev.langchain4j.mcp.client.McpClient
import dev.langchain4j.mcp.client.transport.http.StreamableHttpMcpTransport
import dev.langchain4j.model.openai.OpenAiChatModel
import dev.langchain4j.service.AiServices
import java.time.Duration

data class AssistantOptions(
    val clientUrl: String,
    val modelId: String,
    val apiKey: String,
    val instruction: String?,
    val input: String,
    val mcpServer: McpServer,
)

fun AssistantOptions.buildAssistant(): ChatAssistant {
    // Create the chat client.
    val model = OpenAiChatModel.builder()
        .baseUrl(clientUrl)
        .apiKey(apiKey)
        .modelName(modelId)
        .reasoningEffort("none")
        .build()

    // Create the chat assistant.
    val assistant = AiServices.builder(ChatAssistant::class.java)
        .chatModel(model)
        .userMessage(input)

    // Add system message if available.
    if (instruction != null) {
        assistant.systemMessage(instruction)
    }

    // Create the mcp sever.
    val transport = StreamableHttpMcpTransport.builder()
        .url(mcpServer.url)
        .customHeaders(
            buildMap {
                putAll(mcpServer.customHeaders.orEmpty())
                mcpServer.apiKey?.let {
                    put("Authorization", "Bearer $it")
                }
            },
        )
        .timeout(Duration.ofSeconds(8))
        .build()

    val mcpClient: McpClient = DefaultMcpClient.builder()
        .transport(transport)
        .build()

    // Add the tools from the mcp server.
    val toolProvider = McpToolProvider.builder()
        .mcpClients(mcpClient)
        .build()
    assistant.toolProvider(toolProvider)

    return assistant.build()
}
