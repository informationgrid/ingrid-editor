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
            .timeout(Duration.ofSeconds(5))
            .build()

}