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
package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.services.directus.DirectusClient
import io.kotest.assertions.json.shouldEqualJson
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf

class DirectusIndexerTest : ShouldSpec() {

    private data class Call(val method: String, val path: String, val body: String, val apiKey: String?)

    private val calls = mutableListOf<Call>()
    private val indexInfo = IndexInfo("index", "alias", "uuid")

    private fun createIndexer(batchSize: Int = 100, failOperations: Boolean = false): DirectusIndexer {
        calls.clear()
        val engine = MockEngine { request ->
            val body = (request.body as? TextContent)?.text ?: ""
            val path = request.url.encodedPath
            calls.add(Call(request.method.value, path, body, request.headers["x-api-key"]))
            when {
                path.endsWith("/imports") && request.method.value == "POST" -> {
                    val mode = if (body.contains("full")) "full" else "incremental"
                    respond(
                        """{"catalog_id":"cat","import_id":"imp-1","mode":"$mode","state":"waiting"}""",
                        HttpStatusCode.Created,
                        headersOf("Content-Type", "application/json"),
                    )
                }

                failOperations && path.endsWith("/operations") -> respond("error", HttpStatusCode.BadRequest)

                else -> respond("", HttpStatusCode.Accepted)
            }
        }
        val client = DirectusClient(HttpClient(engine), "https://example.com/ingest/v1/", "directus", "cat", "secret")
        return DirectusIndexer("directus", client, batchSize)
    }

    private fun simplified() = calls.map { "${it.method} ${it.path}" }

    init {
        should("transfer a complete indexing as full import") {
            val indexer = createIndexer(batchSize = 2)

            indexer.createIndex("index", "base", "", "")
            indexer.update(indexInfo, """{"uuid":"1","title":"A"}""")
            indexer.update(indexInfo, """{"uuid":"2","title":"B"}""")
            indexer.update(indexInfo, """{"uuid":"3","title":"C"}""")
            indexer.onFinishIndexAll()
            indexer.flush()

            simplified() shouldContainExactly listOf(
                "POST /ingest/v1/catalogs/cat/imports",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/operations",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/operations",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/commit",
            )
            calls[0].body shouldEqualJson """{"mode":"full"}"""
            calls[1].body shouldEqualJson """{"upsert":[{"uuid":"1","title":"A","id":"1"},{"uuid":"2","title":"B","id":"2"}]}"""
            calls[2].body shouldEqualJson """{"upsert":[{"uuid":"3","title":"C","id":"3"}]}"""
            calls.all { it.apiKey == "secret" } shouldBe true
        }

        should("commit a full import without documents") {
            val indexer = createIndexer()

            indexer.createIndex("index", "base", "", "")
            indexer.onFinishIndexAll()

            simplified() shouldContainExactly listOf(
                "POST /ingest/v1/catalogs/cat/imports",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/commit",
            )
        }

        should("abort a full import which was not finished") {
            val indexer = createIndexer(batchSize = 1)

            indexer.createIndex("index", "base", "", "")
            indexer.update(indexInfo, """{"uuid":"1"}""")
            // onFinishIndexAll is not called because of an error
            indexer.flush()

            simplified() shouldContainExactly listOf(
                "POST /ingest/v1/catalogs/cat/imports",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/operations",
                "DELETE /ingest/v1/catalogs/cat/imports/imp-1",
            )
        }

        should("transfer a single update as incremental import") {
            val indexer = createIndexer()

            indexer.setCatalogId("ige-catalog")
            indexer.update(indexInfo, """{"id":"own-id","uuid":"1"}""")
            indexer.flush()

            simplified() shouldContainExactly listOf(
                "POST /ingest/v1/catalogs/cat/imports",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/operations",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/commit",
            )
            calls[0].body shouldEqualJson """{"mode":"incremental"}"""
            calls[1].body shouldEqualJson """{"upsert":[{"id":"own-id","uuid":"1"}]}"""
        }

        should("transfer a delete as incremental import") {
            val indexer = createIndexer()

            indexer.delete(IndexInfo("index", "alias", null), "1", true)
            indexer.flush()

            simplified() shouldContainExactly listOf(
                "POST /ingest/v1/catalogs/cat/imports",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/operations",
                "POST /ingest/v1/catalogs/cat/imports/imp-1/commit",
            )
            calls[1].body shouldEqualJson """{"delete":[{"id":"1"}]}"""
        }

        should("not send anything on flush without changes") {
            val indexer = createIndexer()

            indexer.flush()

            calls.size shouldBe 0
        }

        should("skip folders") {
            val indexer = createIndexer()

            shouldThrow<IndexException> {
                indexer.update(indexInfo, """{"uuid":"1","isfolder":"true"}""")
            }
            indexer.flush()

            calls.size shouldBe 0
        }

        should("throw an exception if the server responds with an error") {
            val indexer = createIndexer(failOperations = true)

            indexer.update(indexInfo, """{"uuid":"1"}""")

            shouldThrow<IndexException> { indexer.flush() }
        }
    }
}
