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
package de.ingrid.igeserver.services.externalCodelistRepository.repositories

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.services.externalCodelistRepository.ExternalCodelistRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.cache.annotation.Cacheable
import java.io.InputStream
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@JsonIgnoreProperties(ignoreUnknown = true)
data class EpsgApiResponse(
    val Results: List<EpsgCodelistEntry>,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class EpsgCodelistEntry(
    val Code: Int,
    val Name: String,
)

open class EpsgRepository : ExternalCodelistRepository {

    private val log = logger()
    private val mapper = jacksonObjectMapper()
    private val url = "https://apps.epsg.org/api/v1/CoordRefSystem?keywords="

    /**
     * Searches the EPSG API for a term and returns a List of string representations of EPSG Codes.
     */
    @Cacheable(value = ["epsgCodelistCache"], key = "#term")
    override fun search(term: String): List<String> {
        val searchUrl = "$url$term*"

        try {
            val inputStream: InputStream = sendRequest("GET", searchUrl) ?: return emptyList()
            val jsonString = inputStream.bufferedReader().use { it.readText() }
            val apiResponse = mapper.readValue<EpsgApiResponse>(jsonString)
            return apiResponse.Results.map { "EPSG ${it.Code}: ${it.Name}" }
        } catch (e: Exception) {
            log.warn("Error searching EPSG: ${e.message}")
            return emptyList()
        }
    }

    private fun sendRequest(method: String, url: String, body: String? = null): InputStream {
        val executor = Executors.newSingleThreadExecutor()
        val request = httpRequest(method, url, body)
        val http = httpClient(executor)

        return http.send(request, HttpResponse.BodyHandlers.ofInputStream()).body()
    }

    private fun httpClient(executor: ExecutorService?) = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(30))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .executor(executor)
        .build()

    private fun httpRequest(method: String, url: String, body: String?): HttpRequest {
        val msgBody =
            if (body == null) HttpRequest.BodyPublishers.noBody() else HttpRequest.BodyPublishers.ofString(body)
        return HttpRequest.newBuilder()
            .method(method, msgBody)
            .uri(URI.create(url))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofSeconds(60))
            .build()
    }
}
