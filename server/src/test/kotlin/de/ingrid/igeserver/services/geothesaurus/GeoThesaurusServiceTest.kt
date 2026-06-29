/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import com.sun.net.httpserver.HttpServer
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.shouldBe
import java.net.InetSocketAddress

class GeoThesaurusServiceTest : AnnotationSpec() {

    private lateinit var server: HttpServer
    private var port: Int = 0

    @BeforeAll
    fun setup() {
        server = HttpServer.create(InetSocketAddress(0), 0)
        port = server.address.port
        server.start()
    }

    @AfterAll
    fun teardown() {
        server.stop(0)
    }

    @Test
    fun sendRequest_Success() {
        server.createContext("/success") { exchange ->
            val response = "OK"
            exchange.sendResponseHeaders(200, response.length.toLong())
            exchange.responseBody.write(response.toByteArray())
            exchange.close()
        }

        val service = object : GeoThesaurusService() {
            override val id = "test"
            override fun search(term: String, options: GeoThesaurusSearchOptions) = emptyList<SpatialResponse>()
        }

        val result = service.sendRequest("GET", "http://localhost:$port/success")
        result shouldBe "OK"
    }

    @Test
    fun sendRequest_Error() {
        val errorXml = """<?xml version="1.0" encoding="utf-8" ?>
<ServiceExceptionReport xmlns="http://www.opengis.net/ogc">
  <ServiceException locator="securityGate.Server" code="ERROR_ALL_SERVER_UNAVAILABLE">
Invalid response from all Server for this Service.  </ServiceException>
</ServiceExceptionReport>
        """.trimIndent()

        server.createContext("/error") { exchange ->
            val bytes = errorXml.toByteArray()
            exchange.sendResponseHeaders(503, bytes.size.toLong())
            exchange.responseBody.write(bytes)
            exchange.close()
        }

        val service = object : GeoThesaurusService() {
            override val id = "test"
            override fun search(term: String, options: GeoThesaurusSearchOptions) = emptyList<SpatialResponse>()
        }

        val exception = shouldThrow<RuntimeException> {
            service.sendRequest("GET", "http://localhost:$port/error")
        }

        exception.message shouldBe "Request failed with status 503: Invalid response from all Server for this Service."
    }

    @Test
    fun sendRequest_Error_NonXml() {
        val errorText = "Internal Server Error"

        server.createContext("/error-text") { exchange ->
            val bytes = errorText.toByteArray()
            exchange.sendResponseHeaders(500, bytes.size.toLong())
            exchange.responseBody.write(bytes)
            exchange.close()
        }

        val service = object : GeoThesaurusService() {
            override val id = "test"
            override fun search(term: String, options: GeoThesaurusSearchOptions) = emptyList<SpatialResponse>()
        }

        val exception = shouldThrow<RuntimeException> {
            service.sendRequest("GET", "http://localhost:$port/error-text")
        }

        exception.message shouldBe "Request failed with status 500: Internal Server Error"
    }
}
