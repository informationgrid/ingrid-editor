/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.nio.ByteBuffer
import java.util.concurrent.Flow

class ZabbixServiceTest : ShouldSpec() {

    val props = ZabbixProperties("", "", "https://abc.de", "", emptyList(), "", 0)
    val service = ZabbixService(props)
    val x = mockkStatic(HttpClient::newBuilder)
    val httpClientMock = mockk<HttpClient>(relaxed = true)
    val responseCreateHost = mockk<HttpResponse<String>>()
    val responseGetHostGroup = mockk<HttpResponse<String>>()
    val response = mockk<HttpResponse<String>>()

    override suspend fun beforeEach(testCase: TestCase) {
        super.beforeEach(testCase)
    }

    init {

        should("do nothing when there are no uploads") {

            every { HttpClient.newBuilder().build() } returns httpClientMock
            every { responseGetHostGroup.body() } returns """{ "result": [{ "groupid": "1"}] }"""
            every { responseCreateHost.body() } returns """{ "result": { "hostids": [ "1" ] } }"""
            every { response.body() } returns """{ "result": [] }"""

            val bodyHandler = HttpResponse.BodyHandlers.ofString()
            every {
                httpClientMock.send(any(), bodyHandler)
            } answers {
                val requestAsString = getRequestParameter(firstArg())
                if (requestAsString.contains("hostgroup.get")) responseGetHostGroup
                else if (requestAsString.contains("host.create")) responseCreateHost
                else response
            }

            val data = prepareZabbixData(emptyList())
            service.addOrUpdateDocument(data)

            verify(exactly = 3) { httpClientMock.send(any(), bodyHandler) }
        }

        should("get Problems for a catalog") {
            every { HttpClient.newBuilder().build() } returns httpClientMock
            every { responseGetHostGroup.body() } returns """{ "result": [{ "groupid": "1"}] }"""
            every { response.body() } returns
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
                    """

            val bodyHandler = HttpResponse.BodyHandlers.ofString()
            every {
                httpClientMock.send(any(), bodyHandler)
            } answers {
                val requestAsString = getRequestParameter(firstArg())
                if (requestAsString.contains("hostgroup.get")) responseGetHostGroup
                else if (requestAsString.contains("host.create")) responseCreateHost
                else response
            }
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

    private fun prepareZabbixData(uploads: List<ZabbixModel.Upload>): ZabbixModel.ZabbixData {
        return ZabbixModel.ZabbixData("", "", "", "", uploads)
    }

    private fun getRequestParameter(request: HttpRequest): String {
        val res = (request.bodyPublisher().get())
        val sub = Sub()
        res.subscribe(sub)
        return sub.value
    }
}

class Sub : Flow.Subscriber<ByteBuffer> {

    var value: String = ""

    override fun onSubscribe(subscription: Flow.Subscription) {
        println("subscribe")
        subscription.request(100)
    }

    override fun onNext(item: ByteBuffer) {
        println("next")
        println(String(item.array()))
        value = String(item.array())
    }

    override fun onError(throwable: Throwable?) {
        TODO("Not yet implemented")
    }

    override fun onComplete() {
        print("Finished")
    }

}
