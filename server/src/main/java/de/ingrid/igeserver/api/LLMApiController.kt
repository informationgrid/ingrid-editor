/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import com.fasterxml.jackson.databind.ObjectMapper

@RestController
@RequestMapping("/api/llm")
class LLMApiController : LLMApi {

    private val log = logger()
    private val client = HttpClient.newHttpClient()
    private val objectMapper = ObjectMapper()

    @Value("\${mistral.api.url}")
    private lateinit var mistralApiUrl: String

    @Value("\${mistral.api.key}")
    private lateinit var mistralApiKey: String

    override fun processMessage(
        request: LLMRequest
    ): LLMResponse {

        log.debug("Processing LLM request: ${request.message}")

        val requestBody = mapOf(
            "model" to "mistral-large-latest",
            "messages" to listOf(
                mapOf(
                    "role" to "user",
                    "content" to request.message
                )
            )
        )

        val httpRequest = HttpRequest.newBuilder()
            .uri(URI.create("$mistralApiUrl/chat/completions"))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer $mistralApiKey")
            .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
            .build()

        val response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString())
        
        if (response.statusCode() != 200) {
            log.error("Mistral API returned error status: ${response.statusCode()}")
            throw RuntimeException("Mistral API request failed with status: ${response.statusCode()}")
        }

        val jsonResponse = objectMapper.readTree(response.body())
        val content = jsonResponse
            .get("choices")?.get(0)
            ?.get("message")?.get("content")?.asText()
            ?: run {
                log.error("Invalid response structure from Mistral API: ${response.body()}")
                throw RuntimeException("Failed to parse Mistral API response")
            }
        log.debug( "LLM response: $content")

        return LLMResponse(content = content)
    }
}