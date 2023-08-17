package de.ingrid.igeserver.zabbix

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.ZabbixProperties
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

const val JSONRPC = "2.0"

@Service
@Profile("zabbix")
class ZabbixService @Autowired constructor(
    zabbixProperties: ZabbixProperties
) {
    private var log = logger()
    private val apiKey = zabbixProperties.apiKey
    private val apiURL = zabbixProperties.apiURL
    private val checkDelay = zabbixProperties.checkDelay
    private val checkCount = zabbixProperties.checkCount
    val activatedCatalogs = zabbixProperties.catalogs ?: emptyList()
    val detailUrl = zabbixProperties.detailURLTemplate
    val uploadUrl = zabbixProperties.uploadURL

    fun addOrUpdateDocument(data: ZabbixModel.ZabbixData) {
        val jsonWebscenarioGet =
            """{"jsonrpc":"$JSONRPC","method":"httptest.get","params":{"output": ["hostid", "name", "status"],"selectSteps": ["name", "url"],"selectTags": "extend","tags":[{"tag":"id","value":"${data.uuid}","operator":"1"}]},"auth":"$apiKey","id":1}"""
        val result = requestApi(jsonWebscenarioGet).get("result")

        val remoteUploads = result.map { getUpload(it) }.toMutableList()

        val documentsToAdd = mutableListOf<ZabbixModel.Upload>()
        val documentsToDelete = remoteUploads

        data.uploads.forEach { upload ->
            remoteUploads
                .find { upload.url == it.url }
                ?.let { documentsToDelete.remove(it) } ?: documentsToAdd.add(upload)
        }

        log.debug("Delete documents: $documentsToDelete")
        deleteZabbixJob(documentsToDelete)
        log.debug("Add documents: $documentsToAdd")
        createZabbixJob(data.catalogIdentifier, data.uuid, data.documentTitle, data.documentURL, documentsToAdd)
    }

    private fun getUpload(item: JsonNode) = ZabbixModel.Upload(
        getFromStepsAsString(item, "name"),
        getFromStepsAsString(item, "url"),
        getWebscenarioId(item),
    )

    private fun getWebscenarioId(response: JsonNode) = response.get("httptestid").asText()

    private fun createZabbixJob(
        catalogIdentifier: String,
        uuid: String,
        name: String,
        url: String,
        documentsToAdd: List<ZabbixModel.Upload>
    ) {
        val hostId = createHost(uuid, name, url, catalogIdentifier)
        documentsToAdd.forEach { document ->
            log.debug("Add document ${document.name}")
            createWebscenario(uuid, hostId, document.name, document.url)
            createTrigger(uuid, document.name, document.url)
        }
    }

    private fun deleteZabbixJob(documentsToDelete: List<ZabbixModel.Upload>) =
        documentsToDelete.forEach { document -> deleteWebscenario(listOf(document.webscenarioId)) }

    private fun createHostgroup(name: String): String {
        val params = ZabbixModel.CreateParams(name)
        val hostgroup = ZabbixModel.Create(method = "hostgroup.create", params = params, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(hostgroup)
        val response = requestApi(values)
        log.debug(response)
        return getFromResultAsList(response, "groupids")[0].asText()
    }

    private fun createHost(uuid: String, name: String, url: String, catalogName: String): String {
        val jsonHostGroupGet =
            """{"jsonrpc":"$JSONRPC","method":"hostgroup.get","params":{"output":"extend","filter":{"name":["$catalogName"]}},"auth":"$apiKey","id":1}"""
        val responseHostGroupGet = requestApi(jsonHostGroupGet)
        var groupid = responseHostGroupGet.get("result").get(0)?.get("groupid")?.asText() ?: ""
        if (groupid.isEmpty()) groupid = createHostgroup(catalogName)
        val hostname = shortenString(name, 255)
        val visiblename = shortenString(name, 117, true) + " (" + uuid.take(8) + ")"
        val hostUrl = shortenString(url, 255)

        val groups = listOf(ZabbixModel.Group(groupid))
        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("name", hostname),
            ZabbixModel.Tag("url", hostUrl)
        )
        val params = ZabbixModel.HostParams(uuid, visiblename, groups, tags)
        val host = ZabbixModel.Host(method = "host.create", params = params, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(host)
        val response = requestApi(values)
        val hostId: String = if (response.has("error")) {
            val jsonHostGet =
                """{"jsonrpc":"$JSONRPC","method":"host.get","params":{"output":"extend","filter":{"host":["$uuid"]}},"auth":"$apiKey","id":1}"""
            val responseHostGet = requestApi(jsonHostGet)
            val result = getFromResultArray(responseHostGet, "hostid")
            result.asText()
        } else {
            val result = getFromResultAsList(response, "hostids")
            result[0].asText()
        }
        return hostId
    }

    private fun createWebscenario(uuid: String, hostId: String, docName: String, docUrl: String) {
        val docNameStep = shortenString(docName, 64)
        val docNameTag = shortenString(docName, 255)
        val docUrlTag = shortenString(docUrl, 255, true)

        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("document name", docNameTag),
            ZabbixModel.Tag("document url", docUrlTag)
        )
        val steps =
            listOf(ZabbixModel.Step(name = docNameStep, url = docUrl, required = "", status_codes = "200", no = 1))
        val params = ZabbixModel.WebscenarioParams(docNameStep, hostId, checkDelay, steps, tags)
        val webscenario = ZabbixModel.Webscenario(method = "httptest.create", params = params, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(webscenario)
        val response = requestApi(values)
        log.debug(response)
    }

    private fun createTrigger(uuid: String, docName: String, docUrl: String) {
        val docNameShort = shortenString(docName, 64)
        val docNameTriggerExpression = if (docNameShort.contains(",")) "\"$docNameShort\"" else docNameShort
        val docNameTag = shortenString(docName, 255)
        val docUrlTag = shortenString(docUrl, 255, true)

        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("document name", docNameTag),
            ZabbixModel.Tag("document url", docUrlTag)
        )
        val params = ZabbixModel.TriggerParams(
            "Dokument: ${docName.trim()}",
            "min(/$uuid/web.test.fail[$docNameTriggerExpression],#$checkCount)>0",
            4,
            0,
            tags
        )
        val trigger = ZabbixModel.Trigger(method = "trigger.create", params = params, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(trigger)
        val response = requestApi(values)
        log.debug(response)
    }

    private fun deleteHosts(ids: List<String>) {
        val host = ZabbixModel.Delete(method = "host.delete", params = ids, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(host)
        val response = requestApi(values)
        log.debug(response)
    }

    private fun deleteWebscenario(ids: List<String>) {
        val webscenario = ZabbixModel.Delete(method = "httptest.delete", params = ids, auth = apiKey, id = 1)
        val values = jacksonObjectMapper().writeValueAsString(webscenario)
        val response = requestApi(values)
        log.debug(response)
    }

    fun deleteDocument(uuid: String) {
        val deleteJson =
            """{"jsonrpc":"$JSONRPC","method":"host.get","params":{"output": ["hostid", "name", "status"],"selectTags": "extend","tags":[{"tag":"id","value":"$uuid","operator":"1"}]},"auth":"$apiKey","id":1}"""
        val response = requestApi(deleteJson)
        log.debug(response)
        if(resultArrayIsEmpty(response)) {
            log.debug("No host found for uuid $uuid")
            return
        }
        val hostId = getFromResultArray(response, "hostid")
        log.debug("Delete host $uuid")
        deleteHosts(listOf(hostId.asText()))
    }

    private fun getFromResultAsList(response: JsonNode, field: String): List<JsonNode> {
        val array = response.get("result").get(field) as ArrayNode
        return array.map { it }
    }

    private fun resultArrayIsEmpty(response: JsonNode) = response.get("result").size() == 0

    private fun getFromResultArray(response: JsonNode, field: String) = response.get("result").get(0).get(field)

    private fun getFromStepsAsString(response: JsonNode, field: String) = response.get("steps").get(0).get(field).asText()

    private fun shortenString(name: String, length: Int, onlyEnd: Boolean = false): String {
        val delimiter = ".."
        val tname = name.trim()
        return if (tname.length > length) {
            if (onlyEnd)
                tname.take(length - delimiter.length) + delimiter
            else
                tname.take(length / 2) + delimiter + tname.takeLast(length / 2 - delimiter.length)
        } else {
            tname
        }
    }

    private fun requestApi(requestBody: String): JsonNode {
        val client = HttpClient.newBuilder().build()
        val request = HttpRequest.newBuilder()
            .uri(URI.create(this.apiURL))
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .header("Content-Type", "application/json-rpc")
            .build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())
        val json = jacksonObjectMapper().readTree(response.body())

        if (json.has("error")) {
            val error = json.get("error").get("data")?.asText()
            if (error?.contains("exist") == true)
                log.debug(error)
            else
                throw ServerException.withReason(json.get("error").get("data")?.asText() ?: "Request Error occurred")
        }
        return json
    }

}
