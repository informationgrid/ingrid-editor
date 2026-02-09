/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services.piveau

import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.utils.ElasticDocument
import io.ktor.client.HttpClient
import io.ktor.client.request.delete
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.put
import io.ktor.client.request.setBody
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.http.contentType
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger

class PiveauClient(
    private val client: HttpClient,
    private val url: String,
    private val name: String,
    private val apiKey: String? = null,
) {

    private val log = logger()

    fun catalogueExists(catalogId: String): Boolean = runBlocking {
        try {
            val requestUrl = "${url.removeSuffix("/")}/catalogues/$catalogId"
            val response = client.get(requestUrl)
            response.status == HttpStatusCode.OK
        } catch (_: Exception) {
            false
        }
    }

    fun createCatalogue(catalogId: String, title: String) = runBlocking {
        try {
            val requestUrl = "${url.removeSuffix("/")}/catalogues/$catalogId"

            val catalogRdf = """
                <?xml version="1.0" encoding="UTF-8"?>
                <rdf:RDF
                    xmlns:dct="http://purl.org/dc/terms/"
                    xmlns:dcat="http://www.w3.org/ns/dcat#"
                    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
                    <dcat:Catalog rdf:about="https://piveau.io/set/catalogue/$catalogId">
                        <dct:identifier>$catalogId</dct:identifier>
                        <dct:title>$title</dct:title>
                        <dct:description>$title</dct:description>
                        <dct:publisher rdf:resource="https://piveau.io/set/publisher/wemove"/>
                    </dcat:Catalog>
                </rdf:RDF>
            """.trimIndent()

            val response = client.put(requestUrl) {
                contentType(ContentType.parse("application/rdf+xml"))
                apiKey?.let { header("X-API-Key", it) }
                setBody(catalogRdf)
            }
            log.debug("Piveau catalogue creation response: $response")
            if (response.status !in listOf(HttpStatusCode.Created, HttpStatusCode.NoContent)) {
                log.error("Failed to create Piveau catalogue $catalogId: ${response.status}")
                throw IndexException.withReason("Failed to create Piveau catalogue $catalogId: ${response.status}")
            }
            log.info("Successfully created Piveau catalogue $catalogId")
        } catch (e: Exception) {
            log.error("Failed to create Piveau catalogue $catalogId: ${e.message}", e)
            throw IndexException.withReason("Failed to create Piveau catalogue $catalogId: ${e.message}")
        }
    }

    fun insertOrUpdate(doc: ElasticDocument, catalogId: String, transactionId: String) = runBlocking {
        val datasetId = doc["t01_object.id"] ?: doc["id"]
        log.info("Piveau index update: $datasetId for catalog $catalogId")

        val rdf = doc["rdf"]?.toString()
            ?: throw RuntimeException("Document $datasetId does not contain DCAT-AP data. Skipping it.")

        // According to Piveau API: PUT /datasets/{id}
        // The catalogId might be part of the URL or a parameter, but usually Piveau Hub Repo API
        // has /datasets/{id} where the dataset belongs to a catalog.
        // Documentation says: PUT /datasets/{id}?catalogue={catalogueId}
        val requestUrl = "${url.removeSuffix("/")}/catalogues/$catalogId/datasets/origin?originalId=$datasetId"

        val response = client.put(requestUrl) {
            contentType(ContentType.parse("application/rdf+xml")) // Or JSON-LD depending on what Piveau expects/provides
            apiKey?.let { header("X-API-Key", it) }
            setBody(rdf.trimIndent()) // TODO: escape access URL which can contain spaces which do not seem to be allowed in Piveau
        }
        log.debug("Piveau index update response: $response")
        if (response.status !in listOf(HttpStatusCode.Created, HttpStatusCode.NoContent, HttpStatusCode.NotModified)) {
            log.error("Failed to create Piveau dataset in $catalogId: ${response.status}")
            throw IndexException.withReason("Failed to create Piveau dataset in catalogue $catalogId: ${response.status}")
        }
        log.debug("Successfully updated dataset $datasetId in Piveau catalog $catalogId")
    }

    fun delete(uuid: String) = runBlocking {
        log.info("Piveau index delete: $uuid")
        try {
            val requestUrl = "${url.removeSuffix("/")}/datasets/$uuid"
            client.delete(requestUrl) {
                apiKey?.let { header("X-API-Key", it) }
            }
            log.debug("Successfully deleted dataset $uuid from Piveau")
        } catch (e: Exception) {
            log.error("Failed to delete dataset $uuid from Piveau: ${e.message}", e)
        }
    }

    fun cleanupOrphans(catalogId: String, transactionId: String) = runBlocking {
        log.info("Piveau index cleanup for catalog $catalogId with transaction $transactionId")
        // NOTE: Piveau Hub Repo API does not have a direct "cleanup orphans" method.
        // A common implementation would be to list all datasets in the catalogue
        // and delete those that do not match the current transaction/timestamp.
        // For now, we log this as a placeholder for future implementation if needed.
    }

    fun getClient(): HttpClient = client
    fun getUrl(): String = url
    fun getName(): String = name
}
