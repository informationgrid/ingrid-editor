/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services.directus

import de.ingrid.igeserver.exceptions.IndexException
import io.ktor.client.HttpClient
import io.ktor.client.request.HttpRequestBuilder
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.HttpResponse
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.http.encodeURLPathPart
import io.ktor.http.isSuccess
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import tools.jackson.module.kotlin.jacksonObjectMapper

enum class DirectusImportMode(val value: String) {
    FULL("full"),
    INCREMENTAL("incremental"),
}

/**
 * Client for the UmweltNAVI Ingest API ("Directus Push-Schnittstelle").
 *
 * Changes are transferred inside an import session: a session is started (full or incremental),
 * operations (upsert/delete) are sent in batches and finally the session is committed.
 * In a full import all records of the catalog, which were not sent, will be removed by the server.
 */
class DirectusClient(
    private val client: HttpClient,
    url: String,
    private val name: String,
    private val catalogId: String,
    private val apiKey: String?,
) {
    private val log = logger()
    private val mapper = jacksonObjectMapper()
    private val baseUrl = url.trimEnd('/')
    private val importsUrl = "$baseUrl/catalogs/${catalogId.encodeURLPathPart()}/imports"

    fun getVersion(): String = runBlocking {
        val response = client.get("$baseUrl/version") { addApiKey() }
        checkResponse(response, "get version")
        response.bodyAsText()
    }

    /**
     * Starts an import session and returns the ID of the session.
     */
    fun startImport(mode: DirectusImportMode): String = runBlocking {
        val response = client.post(importsUrl) {
            addApiKey()
            contentType(ContentType.Application.Json)
            setBody(mapper.writeValueAsString(mapOf("mode" to mode.value)))
        }
        checkResponse(response, "start import session")
        val body = response.bodyAsText()
        mapper.readTree(body).get("import_id")?.asString()
            ?: throw IndexException.withReason("Directus '$name': No import_id in response: $body")
    }

    fun sendOperations(importId: String, upsert: List<Map<String, Any?>>, delete: List<Map<String, Any?>>) {
        if (upsert.isEmpty() && delete.isEmpty()) return

        runBlocking {
            val payload = buildMap {
                if (upsert.isNotEmpty()) put("upsert", upsert)
                if (delete.isNotEmpty()) put("delete", delete)
            }
            val response = client.post("$importsUrl/${importId.encodeURLPathPart()}/operations") {
                addApiKey()
                contentType(ContentType.Application.Json)
                setBody(mapper.writeValueAsString(payload))
            }
            checkResponse(response, "send operations")
            log.debug("Directus '$name': sent ${upsert.size} upserts and ${delete.size} deletes to import $importId")
        }
    }

    fun commit(importId: String) = runBlocking {
        val response = client.post("$importsUrl/${importId.encodeURLPathPart()}/commit") { addApiKey() }
        checkResponse(response, "commit import session")
        log.debug("Directus '$name': committed import $importId")
    }

    fun abort(importId: String) = runBlocking {
        val response = client.delete("$importsUrl/${importId.encodeURLPathPart()}") { addApiKey() }
        checkResponse(response, "abort import session")
        log.info("Directus '$name': aborted import $importId")
    }

    private fun HttpRequestBuilder.addApiKey() {
        if (!apiKey.isNullOrEmpty()) header("x-api-key", apiKey)
    }

    private suspend fun checkResponse(response: HttpResponse, action: String) {
        if (!response.status.isSuccess()) {
            val message = "Directus '$name': Could not $action (${response.status}): ${response.bodyAsText()}"
            log.error(message)
            throw IndexException.withReason(message)
        }
    }

    fun getClient(): HttpClient = client
    fun getName(): String = name
}
