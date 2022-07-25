package de.ingrid.igeserver.tasks.quartz

import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

@Service
class UrlRequestService {

    private val log = logger()

    private val httpClient: HttpClient = HttpClient.newBuilder()
        .connectTimeout(Duration.ofSeconds(10))
        .followRedirects(HttpClient.Redirect.NORMAL)
        .build()

    fun getStatus(url: String): Int {
        val requestHead = createHttpRequest("HEAD", url)
        var status = httpHeadRequestSync(requestHead)
        // if server responds with NOT ALLOWED try with GET request
        if (status == 405) {
            val requestGet = createHttpRequest("GET", url)
            status = httpHeadRequestSync(requestGet)
        }
        log.debug("Status of URL '$url' is $status")
        return status
    }

    private fun httpHeadRequestSync(request: HttpRequest): Int {
        return try {
            log.debug("Check URL '${request.uri()}' with method '${request.method()}'")
            httpClient
                .send(request, HttpResponse.BodyHandlers.discarding())
                .statusCode()
        } catch (ex: Exception) {
            log.warn("Error requesting URL '${request.uri()}': ${ex.message}")
            500
        }
    }

    private fun createHttpRequest(method: String, url: String): HttpRequest {
        return HttpRequest.newBuilder()
            .method(method, HttpRequest.BodyPublishers.noBody())
            .uri(URI.create(url))
            .build()
    }

    fun isSuccessCode(status: Int): Boolean {
        return status <= 400
    }
}
