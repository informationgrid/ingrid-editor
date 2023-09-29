package de.ingrid.igeserver.ogc

import org.apache.http.HttpEntity
import org.apache.http.HttpResponse
import org.apache.http.client.methods.RequestBuilder
import org.apache.http.entity.StringEntity
import org.apache.http.impl.client.HttpClientBuilder
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.io.IOException
import java.util.*


@Component
class IntegrationTestUtils {

    @Autowired
    private lateinit var testUtils: TestUtils

    @Value("\${recordsapi.basicauth.password}")
    private val apiPassword: String? = null

    @Value("\${recordsapi.test.hostname}:\${server.port}\${server.servlet.contextPath}")
    private val baseUri: String? = "http://localhost:8550"

    @Throws(IOException::class)
    fun request(method: String?, path: String) {
        this.request(method, path, null, null)
    }

    @Throws(IOException::class)
    fun post(path: String, payload: String?, mimeType: String?): HttpResponse? {
        return this.request("POST", path, payload, mimeType)
    }

    @Throws(IOException::class)
    operator fun get(path: String): HttpResponse? {
        return this.request("GET", path, null, null)
    }

    @Throws(IOException::class)
    fun delete(path: String, mimeType: String?): HttpResponse? {
        return this.request("DELETE", path, null, null)
    }

    @Throws(IOException::class)
    fun patch(path: String, payload: String?, mimeType: String?): HttpResponse? {
        return this.request("PATCH", path, payload, mimeType)
    }

    /**
     * Send a request to the API and return the response.
     */
    @Throws(IOException::class)
    fun request(method: String?, path: String, payload: String?, mimeType: String?): HttpResponse? {
        val uri = baseUri + path
        var builder = RequestBuilder.create(method).setUri(uri)
        if (apiPassword != null) {
            builder.setHeader("Authorization", "Basic " + base64("admin:" + apiPassword))
        }
        builder.setHeader("Accept", "application/json")
        if (payload != null) {
            val entity: HttpEntity = StringEntity(payload, mimeType, "UTF-8")
            builder = builder.setEntity(entity)
        }
        val request = builder.build()
        return HttpClientBuilder.create().build().execute(request)
    }

    @Throws(IOException::class)
    fun expected(source: String?, format: String): String? {
        val ext = if (format == "json") "json" else "xml"
        return testUtils.readFile("integration", source, "expected", "correct.$format.$ext")
    }

    fun assertEqualsWithoutIndentation(expected: String, actual: String) {
        assertEquals(expected.replace("(?m)^\\s+".toRegex(), ""), actual.replace("(?m)^\\s+".toRegex(), ""))
    }

    fun base64(s: String): String {
        return Base64.getEncoder().encodeToString(s.toByteArray())
    }
}