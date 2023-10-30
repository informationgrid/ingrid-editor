package de.ingrid.igeserver.zabbix

import de.ingrid.igeserver.configuration.ZabbixProperties
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.core.test.TestCase
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
