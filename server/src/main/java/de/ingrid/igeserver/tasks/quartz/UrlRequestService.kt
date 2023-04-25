package de.ingrid.igeserver.tasks.quartz

import org.apache.logging.log4j.LogManager
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

@Service
class UrlRequestService {

    private companion object {
        private val log = LogManager.getLogger()
    }

    fun getStatus(url: String): Int {
        return try {
            val requestHead = createHttpRequest("HEAD", url)
            var status = httpRequestSync(requestHead)
            // if server responds with NOT ALLOWED try with GET request
            if (status == 405) {
                val requestGet = createHttpRequest("GET", url)
                status = httpRequestSync(requestGet)
            }
            log.debug("Status of URL '$url' is $status")
            status
        } catch (e: Exception) {
            log.debug("URL seems invalid: $url")
            500
        }
    }

    private fun createHttpClient(executor: ExecutorService) = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .executor(executor)
        .build()

    private fun httpRequestSync(request: HttpRequest): Int {
        val executor = Executors.newSingleThreadExecutor()
        val httpClient = createHttpClient(executor)

        return try {
            log.debug("Check URL '{}' with method '{}'", request.uri(), request.method())
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
        return status <= 400
    }
}
