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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.ZabbixProperties
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.security.MessageDigest

const val JSONRPC = "2.0"

@Service
@Profile("zabbix")
class ZabbixService(
    zabbixProperties: ZabbixProperties,
) {
    private var log = logger()
    private val apiKey = zabbixProperties.apiKey
    private val apiURL = zabbixProperties.apiURL
    private val checkDelay = zabbixProperties.checkDelay
    private val checkCount = zabbixProperties.checkCount
    private val userGroupId = zabbixProperties.userGroupId
    val activatedCatalogs = zabbixProperties.catalogs ?: emptyList()
    val detailUrl = zabbixProperties.detailURLTemplate

    fun addOrUpdateDocument(data: ZabbixModel.ZabbixData) {
        val remoteUploads = requestApi(getUploadsPayload(data.uuid)).get("result")
            .map { getUpload(it) }.toMutableList()

        val documentsToAdd = mutableListOf<ZabbixModel.Upload>()
        val documentsToDelete = getUploadedDocuments(remoteUploads)

        data.uploads.forEach { upload ->
            remoteUploads
                .find { upload.url == it.url }
                ?.let { documentsToDelete.remove(it) }
                ?: documentsToAdd.add(upload).also {
                    log.debug("Remote document not found: ${upload.url} in $remoteUploads")
                }
        }

        log.debug("Delete documents: $documentsToDelete")
        deleteZabbixJob(documentsToDelete)
        log.debug("Add documents: $documentsToAdd")
        createZabbixJob(
            data.catalogIdentifier,
            data.uuid,
            data.documentTitle,
            data.documentURL,
            data.addressMail,
            documentsToAdd,
        )
    }

    // get only uploaded documents without check for assessment website
    private fun getUploadedDocuments(remoteUploads: MutableList<ZabbixModel.Upload>): MutableList<ZabbixModel.Upload> = remoteUploads.filter { !it.name.matches(Regex("^Verfahren \\w{4}$")) }.toMutableList()

    /**
     * @return userId of created user
     */
    private fun createUser(addressMail: String): String {
        val passwd = "readOnly"
        val paramsUsergroup = listOf(ZabbixModel.UserGroup(userGroupId))
        val paramsMedias = listOf(ZabbixModel.Media("1", addressMail, 0, 63, "1-7,00:00-24:00"))
        val params = ZabbixModel.UserParams(addressMail, passwd, "4", paramsUsergroup, paramsMedias)
        val user = ZabbixModel.User(method = "user.create", params = params)
        val values = jacksonObjectMapper().writeValueAsString(user)
        val response = requestApi(values)
        val userid: String = if (response.has("error")) {
            getUserId(addressMail)
        } else {
            getFromResultAsList(response, "userids")[0].asText()
        }
        return userid
    }

    data class Action(
        val id: String,
        val userid: String,
    )

    data class User(
        val sendto: String?,
        val actions: Int,
    )

    private fun getAction(uuid: String): Action? {
        val request =
            """{"jsonrpc":"$JSONRPC","method":"action.get","params":{"output":["actionid","name"],"selectOperations": ["opmessage_usr"],"filter":{"name":["$uuid"]}},"id":1}"""
        val response = requestApi(request).get("result").get(0) ?: return null

        return Action(
            id = response.get("actionid").asText(),
            userid = response["operations"].get(0).get("opmessage_usr").get(0).get("userid").asText(),
        )
    }

    private fun getUserFromAction(userid: String): User {
        val request =
            """{"jsonrpc":"$JSONRPC","method":"action.get","params":{"output":["actionid","name"],"selectOperations": ["opmessage_usr"]},"id":1}"""
        val response = requestApi(request)
        val actionSize = response["result"]
            .filter {
                it["operations"]?.get(0)?.get("opmessage_usr")?.get(0)?.get("userid")?.asText() == userid
            }.size

        return User(
            sendto = getUser("userid", userid)?.get("medias")?.get(0)?.get("sendto")?.get(0)?.asText(),
            actions = actionSize,
        )
    }

    private fun getUser(field: String, value: String): JsonNode? {
        val response =
            requestApi("""{"jsonrpc":"$JSONRPC","method":"user.get","params":{"output":["userid","username"],"selectMedias": ["sendto"],"filter":{"$field":["$value"]}},"id":1}""")
        return response.get("result").get(0) ?: return null
    }

    /**
     * @return userId of created user or null if no new user needed
     */
    private fun updateUserMail(uuid: String, addressMail: String): String? {
        val action = getAction(uuid)
        val user = action?.let { getUserFromAction(it.userid) }

        if (action != null && user?.sendto != addressMail) {
            deleteAction(listOf(action.id))
            if (user?.actions == 1) {
                deleteUser(listOf(action.userid))
                return createUser(addressMail)
            }
        }
        return null
    }

    private fun createAction(uuid: String, addressMail: String) {
        val userid = getUser("username", addressMail)?.get("userid")?.asText() ?: createUser(addressMail)
        val updatedUserId = updateUserMail(uuid, addressMail) ?: userid
        requestApi(getActionPayload(uuid, updatedUserId))
    }

    private fun getUserId(username: String): String {
        val jsonUserGet =
            """{"jsonrpc":"$JSONRPC","method":"user.get","params":{"output":["userid","username"],"filter":{"username":["$username"]}},"id":1}"""
        val responseUserGet = requestApi(jsonUserGet)
        return responseUserGet.get("result").get(0).get("userid").asText()
    }

    private fun deleteUser(userid: List<String>) {
        val user = ZabbixModel.Delete(method = "user.delete", params = userid)
        val values = jacksonObjectMapper().writeValueAsString(user)
        requestApi(values)
    }

    private fun deleteAction(actionid: List<String>) {
        val action = ZabbixModel.Delete(method = "action.delete", params = actionid)
        val values = jacksonObjectMapper().writeValueAsString(action)
        requestApi(values)
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
        addressMail: String?,
        documentsToAdd: List<ZabbixModel.Upload>,
    ) {
        val hostId = getHostId(uuid) ?: createHost(uuid, name, url, catalogIdentifier)
        log.debug("Add document url: $url to host $hostId with name $name and uuid $uuid")
        createWebscenario(uuid, hostId, "Verfahren", url, 2, "page-wrapper")
        createTrigger(uuid, "Verfahren", url)
        if (!addressMail.isNullOrEmpty()) {
            // only create notification job when mail is set
            createUser(addressMail)
            createAction(uuid, addressMail)
        }
        documentsToAdd.forEach { document ->
            log.debug("Add document ${document.name}")
            createWebscenario(uuid, hostId, document.name, document.url, 1, "")
            createTrigger(uuid, document.name, document.url)
        }
    }

    private fun deleteZabbixJob(documentsToDelete: List<ZabbixModel.Upload>) = documentsToDelete.forEach { document -> deleteWebscenario(listOf(document.webscenarioId)) }

    private fun createHostgroup(name: String): String {
        val params = ZabbixModel.CreateParams(name)
        val hostgroup = ZabbixModel.Create(method = "hostgroup.create", params = params)
        val values = jacksonObjectMapper().writeValueAsString(hostgroup)
        val response = requestApi(values)
        return getFromResultAsList(response, "groupids")[0].asText()
    }

    private fun getHostGroupId(catalogName: String): String? {
        val jsonHostGroupGet =
            """{"jsonrpc":"$JSONRPC","method":"hostgroup.get","params":{"output":"extend","filter":{"name":["$catalogName"]}},"id":1}"""
        val responseHostGroupGet = requestApi(jsonHostGroupGet)
        return responseHostGroupGet.get("result").get(0)?.get("groupid")?.asText()
    }

    private fun getHostId(uuid: String): String? {
        val jsonHostGet =
            """{"jsonrpc":"$JSONRPC","method":"host.get","params":{"output":"extend","filter":{"host":["$uuid"]}},"id":1}"""
        val responseHostGet = requestApi(jsonHostGet)
        return responseHostGet.get("result").get(0)?.get("hostid")?.asText()
    }

    private fun createHost(uuid: String, name: String, url: String, catalogName: String): String {
        val groupid = getHostGroupId(catalogName) ?: createHostgroup(catalogName)
        val hostname = shortenString(name, 255)
        // e.g. "name": "test (12345678)"
        val visiblename = shortenString(name, 117, true) + " (" + uuid.take(8) + ")"
        val hostUrl = shortenString(url, 255)

        val groups = listOf(ZabbixModel.Group(groupid))
        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("name", hostname),
            ZabbixModel.Tag("url", hostUrl),
        )
        val params = ZabbixModel.HostParams(uuid, visiblename, groups, tags)
        val host = ZabbixModel.Host(method = "host.create", params = params)
        val response = requestApi(
            jacksonObjectMapper().writeValueAsString(host),
        )
        return getFromResultAsList(response, "hostids")[0].asText()
    }

    fun getProblems(catalogName: String): List<ZabbixModel.Problem> {
        val groupid = getHostGroupId(catalogName) ?: return emptyList()
        val jsonProblemsGet =
            """
                {
                    "jsonrpc": "$JSONRPC",
                    "method": "problem.get",
                    "params": {
                        "selectTags": "extend",
                        "recent": "true",
                        "sortfield": ["eventid"],
                        "sortorder": "DESC",
                        "groupids": "$groupid"
                    },
                    "id": 1
                }
            """.trimIndent()
        val response = requestApi(jsonProblemsGet)
        if (resultArrayIsEmpty(response)) {
            log.debug("No problems found for catalog $catalogName")
            return emptyList()
        }
        return response.get("result").map { getProblem(it) }
    }

    private fun getTag(item: JsonNode, tagName: String) = item.get("tags").filter { it.get("tag")?.asText() == tagName }.map { it.get("value") }[0].asText()

    private fun getProblem(item: JsonNode) = ZabbixModel.Problem(
        eventid = item.get("eventid").asText(),
        objectid = item.get("objectid").asText(),
        clock = item.get("clock").asText(),
        docName = getTag(item, "document name"),
        name = getTag(item, "name"),
        url = getTag(item, "url"),
        docUrl = getTag(item, "document url"),
        docUuid = getTag(item, "id"),
        severity = item.get("severity").asText(),
    )

    private fun createWebscenario(uuid: String, hostId: String, docName: String, docUrl: String, retrieveMode: Int, required: String) {
        val docNameStep = createDocumentName(docName, docUrl)
        val docNameTag = shortenString(docName, 255)
        val docUrlTag = shortenString(docUrl, 255, true)

        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("document name", docNameTag),
            ZabbixModel.Tag("document url", docUrlTag),
        )
        val steps =
            listOf(ZabbixModel.Step(name = docNameStep, retrieve_mode = retrieveMode, url = docUrl, required = required))
        val params = ZabbixModel.WebscenarioParams(docNameStep, hostId, checkDelay, steps, tags)
        val webscenario = ZabbixModel.Webscenario(method = "httptest.create", params = params)
        val values = jacksonObjectMapper().writeValueAsString(webscenario)
        requestApi(values)
    }

    private fun createTrigger(uuid: String, docName: String, docUrl: String) {
        val docNameShort = createDocumentName(docName, docUrl)
        //  wrap docName in quotes if it contains a comma for zabbix compatibility
        val docNameTriggerExpression = if (docNameShort.contains(",")) "\"$docNameShort\"" else docNameShort
        val docNameTag = shortenString(docName, 255)
        val docUrlTag = shortenString(docUrl, 255, true)

        val tags = listOf(
            ZabbixModel.Tag("id", uuid),
            ZabbixModel.Tag("document name", docNameTag),
            ZabbixModel.Tag("document url", docUrlTag),
        )
        val params = ZabbixModel.TriggerParams(
            description = "Dokument: $docNameShort",
            expression = "min(/$uuid/web.test.fail[$docNameTriggerExpression],#$checkCount)>0",
            priority = 4,
            status = 0,
            tags = tags,
        )
        val trigger = ZabbixModel.Trigger(method = "trigger.create", params = params)
        val values = jacksonObjectMapper().writeValueAsString(trigger)
        requestApi(values)
    }

    private fun deleteHosts(ids: List<String>) {
        val host = ZabbixModel.Delete(method = "host.delete", params = ids)
        val values = jacksonObjectMapper().writeValueAsString(host)
        requestApi(values)
    }

    private fun deleteWebscenario(ids: List<String>) {
        val webscenario = ZabbixModel.Delete(method = "httptest.delete", params = ids)
        val values = jacksonObjectMapper().writeValueAsString(webscenario)
        requestApi(values)
    }

    fun deleteDocument(uuid: String) {
        val deleteJson =
            """{"jsonrpc":"$JSONRPC","method":"host.get","params":{"output": ["hostid", "name", "status"],"selectTags": "extend","tags":[{"tag":"id","value":"$uuid","operator":"1"}]},"id":1}"""
        val response = requestApi(deleteJson)
        if (resultArrayIsEmpty(response)) {
            log.debug("No host found for uuid $uuid")
            return
        }
        val hostId = getFromResultArray(response, "hostid")
        log.debug("Delete host $uuid")
        deleteHosts(listOf(hostId.asText()))

        val action = getAction(uuid)
        val user = getAction(uuid)?.let { getUserFromAction(it.userid) }
        action?.let {
            log.debug("Delete action ${action.id}")
            deleteAction(listOf(action.id))
            if (user?.actions == 1) deleteUser(listOf(action.userid))
        }
    }

    private fun getFromResultAsList(response: JsonNode, field: String): List<JsonNode> {
        val array = response.get("result").get(field) as ArrayNode
        return array.map { it }
    }

    private fun resultArrayIsEmpty(response: JsonNode) = response.get("result").size() == 0

    private fun getFromResultArray(response: JsonNode, field: String) = response.get("result").get(0).get(field)

    private fun getFromStepsAsString(response: JsonNode, field: String) = response.get("steps").get(0).get(field).asText()

    /**
     * Shortens a string to a given length and adds a delimiter in the middle
     *
     * @param name the string to shorten
     * @param length the maximum length of the string
     * @param onlyEnd if true, only the end of the string is shortened
     */
    private fun shortenString(name: String, length: Int, onlyEnd: Boolean = false): String {
        val delimiter = ".."
        val trimmedName = name.trim()
        return if (trimmedName.length > length) {
            if (onlyEnd) {
                trimmedName.take(length - delimiter.length) + delimiter
            } else {
                trimmedName.take(length / 2) + delimiter + trimmedName.takeLast(length / 2 - delimiter.length)
            }
        } else {
            trimmedName
        }
    }

    private fun addAuthToBody(requestBody: String) = if (requestBody.contains("auth")) {
        requestBody
    } else {
        requestBody.substringBeforeLast("}") + ", \"auth\": \"${this.apiKey}\" }"
    }

    private fun requestApi(requestBody: String): JsonNode {
        val client = HttpClient.newBuilder().build()
        val request = HttpRequest.newBuilder()
            .uri(URI.create(this.apiURL))
            .POST(
                HttpRequest.BodyPublishers.ofString(
                    addAuthToBody(requestBody),
                ),
            )
            .header("Content-Type", "application/json-rpc")
            .build()
        val response = client.send(request, HttpResponse.BodyHandlers.ofString())

        if (response.statusCode() != 200) {
            throw ServerException.withReason("Api request failed with status code: ${response.statusCode()} ${sanitizeRequest(requestBody)}")
        }

        val json = jacksonObjectMapper().readTree(response.body())

        if (json.has("error")) {
            val error = json.get("error").get("data")?.asText()
            with(error) {
                when {
                    isNullOrEmpty() -> throw ServerException.withReason("Request Error occurred. No error Data")
                    contains("already exists") -> log.debug(this)
                    contains("Invalid email address") -> log.error("Request failed: ${sanitizeRequest(requestBody)}")
                    else -> throw ServerException.withReason(this)
                }
            }
        }
        return json
    }

    private fun sanitizeRequest(requestBody: String): String = if (requestBody.contains("auth")) {
        requestBody.substring(0, requestBody.indexOf("auth"))
    } else {
        requestBody
    }

    fun getTriggerEvents(triggerId: String): List<ZabbixModel.Problem>? {
        val jsonEventsGet =
            """
                {
                    "jsonrpc": "$JSONRPC",
                    "method": "event.get",
                    "params": {
                        "selectTags": "extend",
                        "output": "extend",
                        "objectids": "$triggerId",
                        "sortfield": ["clock", "eventid"],
                        "sortorder": "DESC",
                        "limit": 10
                    },
                    "id": 1
                }
            """.trimIndent()
        val response = requestApi(jsonEventsGet)
        if (resultArrayIsEmpty(response)) {
            log.debug("No problems found for trigger $triggerId")
            return null
        } else {
            return response.get("result").map { getProblem(it) }
        }
    }

    fun getTriggerIds(uuid: String): List<String> {
        val jsonTriggerGet =
            """
                {
                    "jsonrpc": "$JSONRPC",
                    "method": "trigger.get",
                    "params": {
                        "output": [],
                        "tags":[{"tag":"id","value":"$uuid","operator":"1"}]
                    },
                    "id": 1
                }
            """.trimIndent()
        val results = requestApi(jsonTriggerGet).get("result") as ArrayNode
        return results.mapNotNull { it.get("triggerid")?.asText() }
    }

    private fun createHash(url: String): String {
        val bytes = url.toByteArray()
        val md = MessageDigest.getInstance("SHA-256")
        val digest = md.digest(bytes)
        return digest.fold("", { str, it -> str + "%02x".format(it) })
    }

    private fun createDocumentName(docName: String, docUrl: String): String {
        val hash = createHash(docUrl)
        return shortenString(docName + " " + hash.take(4), 64)
    }
}
