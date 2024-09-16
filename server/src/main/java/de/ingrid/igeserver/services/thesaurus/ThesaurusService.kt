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
package de.ingrid.igeserver.services.thesaurus

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

abstract class ThesaurusService {

    abstract val id: String

    abstract fun search(term: String, options: ThesaurusSearchOptions): List<Keyword>

    fun sendRequest(method: String, url: String): String {
        val executor = Executors.newSingleThreadExecutor()
        val request = httpRequest(method, url)
        val http = httpClient(executor)

        return http.send(request, HttpResponse.BodyHandlers.ofString()).body()
    }

    private fun httpClient(executor: ExecutorService?) =
        HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .executor(executor)
            .build()

    private fun httpRequest(method: String, url: String) =
        HttpRequest.newBuilder()
            .method(method, HttpRequest.BodyPublishers.noBody())
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(10))
            .build()
}
