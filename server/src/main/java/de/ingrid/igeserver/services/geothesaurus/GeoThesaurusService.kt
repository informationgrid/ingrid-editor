package de.ingrid.igeserver.services.geothesaurus

import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

data class GeoThesaurusSearchOptions(
    val searchType: String
)

data class SpatialResponse(
    val id: String,
    val name: String
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