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
package de.ingrid.igeserver.tasks.quartz

import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import java.io.InputStream
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@Service
class UrlRequestService {

    private val log = logger()

    fun getStatus(url: String): Int {
        return try {
            log.debug("Check URL '$url' ...")
            val requestHead = createHttpRequest("HEAD", url)
            var status = httpRequestSyncStatusCode(requestHead)
            // if server responds with NOT ALLOWED try with GET request
            if (status == 405) {
                val requestGet = createHttpRequest("GET", url)
                status = httpRequestSyncStatusCode(requestGet)
            }
            log.debug("Status of URL '$url' is $status")
            status
        } catch (e: Exception) {
            log.debug("URL seems invalid: $url")
            500
        }
    }

    fun request(url: String): InputStream? {
        return try {
            val requestHead = createHttpRequest("GET", url)
            return httpRequestSync(requestHead).body()
        } catch (e: Exception) {
            log.debug("URL seems invalid: $url")
            null
        }
    }

    private fun createHttpClient(executor: ExecutorService) = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .executor(executor)
        .build()

    private fun httpRequestSync(request: HttpRequest): HttpResponse<InputStream> {
        val executor = Executors.newSingleThreadExecutor()
        val httpClient = createHttpClient(executor)

        return try {
            httpClient
                .send(request, HttpResponse.BodyHandlers.ofInputStream())
        } finally {
            executor.shutdownNow()
        }
    }

    private fun httpRequestSyncStatusCode(request: HttpRequest): Int {
        val executor = Executors.newSingleThreadExecutor()
        val httpClient = createHttpClient(executor)

        return try {
            httpClient
                .send(request, HttpResponse.BodyHandlers.discarding())
                .statusCode()
        } catch (ex: Exception) {
            log.warn("Error requesting URL '${request.uri()}': ${ex.message}")
            500
        } finally {
            executor.shutdownNow()
        }
    }

    private fun createHttpRequest(method: String, url: String): HttpRequest {
        return HttpRequest.newBuilder()
            .method(method, HttpRequest.BodyPublishers.noBody())
            .uri(URI.create(url))
            .timeout(Duration.ofSeconds(5))
            .build()
    }

    fun isSuccessCode(status: Int): Boolean {
        return status < 400
    }
}
