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
package de.ingrid.igeserver.services.geothesaurus

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

data class GeoThesaurusSearchOptions(
    val searchType: ThesaurusSearchType
)

data class SpatialResponse(
    val id: String,
    var type: String,
    @JsonIgnore val typeId: String?,
    val name: String?,
    val bbox: BoundingBox,
    val ars: String?,
    val hasMoreResults: Boolean
)

data class BoundingBox(
    val lat1: Number,
    val lon1: Number,
    val lat2: Number,
    val lon2: Number,
)

abstract class GeoThesaurusService {

    abstract val id: String

    abstract fun search(term: String, options: GeoThesaurusSearchOptions): List<SpatialResponse>

    fun sendRequest(method: String, url: String, body: String? = null): String {
        val executor = Executors.newSingleThreadExecutor()
        val request = httpRequest(method, url, body)
        val http = httpClient(executor)

        return http.send(request, HttpResponse.BodyHandlers.ofString()).body()
    }

    private fun httpClient(executor: ExecutorService?) =
        HttpClient.newBuilder()
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
            .header("Content-Type", "application/xml")
            .timeout(Duration.ofSeconds(60))
            .build()
    }
}