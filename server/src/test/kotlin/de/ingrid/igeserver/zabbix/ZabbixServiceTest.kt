/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.zabbix

import de.ingrid.igeserver.configuration.ZabbixProperties
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.core.test.TestCase
import io.kotest.matchers.shouldBe
import io.ktor.client.HttpClient
import io.ktor.client.engine.mock.MockEngine
import io.ktor.client.engine.mock.respond
import io.ktor.http.HttpStatusCode
import io.ktor.http.content.ByteArrayContent
import io.ktor.http.content.OutgoingContent
import io.ktor.http.content.TextContent
import io.ktor.http.headersOf

class ZabbixServiceTest : ShouldSpec() {

    val props = ZabbixProperties("", "https://abc.de", "", emptyList(), "", 0, "", ZabbixProperties.Cleanup("", 20))
    private lateinit var service: ZabbixService
    private lateinit var client: HttpClient
    private var requestCount: Int = 0

    override suspend fun beforeEach(testCase: TestCase) {
        super.beforeEach(testCase)
        requestCount = 0
    }

    init {

        should("do nothing when there are no uploads") {

            val engine = MockEngine { request ->
                requestCount++
                val bodyText = requestBodyAsText(request.body)
                val payload = when {
                    bodyText.contains("hostgroup.get") -> """{ "result": [{ "groupid": "1"}] }"""
                    bodyText.contains("host.create") -> """{ "result": { "hostids": [ "1" ] } }"""
                    bodyText.contains("user.create") -> """{ "result": { "userids": [ "1" ] } }"""
                    else -> """{ "result": [] }"""
                }
                respond(
                    content = payload,
                    status = HttpStatusCode.OK,
                    headers = headersOf("Content-Type", "application/json"),
                )
            }

            client = HttpClient(engine)
            service = ZabbixService(props, client)

            val data = prepareZabbixData(emptyList())
            service.addOrUpdateDocument(data)

            // requests for document, httptest, hostgroup and host
            requestCount shouldBe 6
        }

        should("get Problems for a catalog") {
            val engine = MockEngine { request ->
                requestCount++
                val bodyText = requestBodyAsText(request.body)
                val payload =
                    if (bodyText.contains("hostgroup.get")) {
                        """{ "result": [{ "groupid": "1"}] }"""
                    } else {
                        """
                        {
                          "jsonrpc": "2.0",
                          "result": [
                            {
                              "eventid": "eventid",
                              "objectid": "objectid",
                              "clock": "1701598217",
                              "name": "Dokument: Name",
                              "severity": "4",
                              "tags": [
                                {"tag": "document name","value": "doc_name"},
                                {"tag": "document url","value": "doc.url"},
                                {"tag": "id","value": "doc_uuid"},
                                {"tag": "name","value": "dataset_name"},
                                {"tag": "url","value": "dataset.url"}
                              ]
                            },
                            {
                              "eventid": "eventid2",
                              "objectid": "objectid2",
                              "clock": "1701598000",
                              "name": "Dokument: Name2",
                              "severity": "4",
                              "tags": [
                                {"tag": "document name","value": "doc_name2"},
                                {"tag": "document url","value": "doc.url2"},
                                {"tag": "id","value": "doc_uuid2"},
                                {"tag": "name","value": "dataset_name2"},
                                {"tag": "url","value": "dataset.url2"}
                              ]
                            }
                          ],
                          "id": 1
                        }
                        """.trimIndent()
                    }
                respond(
                    content = payload,
                    status = HttpStatusCode.OK,
                    headers = headersOf("Content-Type", "application/json"),
                )
            }

            client = HttpClient(engine)
            service = ZabbixService(props, client)

            val problems = service.getProblems("test_catalog")
            problems.size shouldBe 2
            problems[0].eventid shouldBe "eventid"
            problems[0].objectid shouldBe "objectid"
            problems[0].clock shouldBe "1701598217"
            problems[0].name shouldBe "dataset_name"
            problems[0].docName shouldBe "doc_name"
            problems[0].docUrl shouldBe "doc.url"
            problems[0].docUuid shouldBe "doc_uuid"
            problems[0].url shouldBe "dataset.url"
        }
    }

    private fun prepareZabbixData(uploads: List<ZabbixModel.Upload>): ZabbixModel.ZabbixData = ZabbixModel.ZabbixData("", "", "", "", "", "", uploads)

    private fun requestBodyAsText(body: Any): String = when (body) {
        is TextContent -> body.text
        is ByteArrayContent -> body.bytes().decodeToString()
        is OutgoingContent.ReadChannelContent -> ""
        else -> ""
    }
}
