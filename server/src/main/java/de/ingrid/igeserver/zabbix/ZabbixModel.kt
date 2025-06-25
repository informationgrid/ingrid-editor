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

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("zabbix")
class ZabbixModel {

    data class Host(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: HostParams,
        val id: Int = 1,
    )

    data class Webscenario(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: WebscenarioParams,
        val id: Int = 1,
    )

    data class Step(
        val name: String,
        val retrieve_mode: Int = 1,
        val url: String,
        val required: String,
        val status_codes: String = "200",
        val no: Int = 1,
    )

    data class Trigger(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: TriggerParams,
        val id: Int = 1,
    )

    data class Group(val groupid: String)

    data class Tag(val tag: String, val value: String)

    data class HostParams(
        val host: String,
        val name: String?,
        val groups: List<Group>,
        val tags: List<Tag>?,
    )

    data class WebscenarioParams(
        val name: String,
        val hostid: String,
        val delay: String,
        val steps: List<Step>,
        val tags: List<Tag>?,
    )

    data class TriggerParams(
        val description: String?,
        val expression: String,
        val priority: Int,
        val status: Int = 0,
        val tags: List<Tag>?,
    )

    data class ZabbixData(
        val catalogIdentifier: String,
        val uuid: String,
        val documentTitle: String,
        val documentURL: String,
        val addressName: String?,
        val addressMail: String?,
        val uploads: List<Upload>,
    )

    data class Upload(
        val name: String,
        val url: String,
        val webscenarioId: String = "",
    )

    data class Create(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: CreateParams,
        val id: Int = 1,
    )

    data class CreateParams(
        val name: String,
    )

    data class Delete(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: List<String>,
        val id: Int = 1,
    )

    data class Problem(
        var eventid: String,
        val objectid: String,
        val clock: String,
        val docName: String,
        val name: String,
        val url: String,
        val docUrl: String,
        val docUuid: String,
        val severity: String,
    )

    data class User(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: UserParams,
        val id: Int = 1,
    )

    data class UserParams(
        val username: String,
        val passwd: String,
        val roleid: String,
        val usrgrps: List<UserGroup>,
        val medias: List<Media>,
    )

    data class UserGroup(
        val usrgrpid: String,
    )

    data class Media(
        val mediatypeid: String,
        val sendto: String,
        val active: Int,
        val severity: Int,
        val period: String,
    )
}

fun getUploadsPayload(uuid: String, apiKey: String): String = """
    {
        "jsonrpc": "$JSONRPC",
        "method": "httptest.get",
        "params": {
            "output": [
                "hostid",
                "name",
                "status"
            ],
            "selectSteps": [
                "name",
                "url"
            ],
            "selectTags": "extend",
            "tags": [
                {
                    "tag": "id",
                    "value": "$uuid",
                    "operator": "1"
                }
            ]
        },
        "id": 1
    }
""".trimIndent()

fun getActionPayload(uuid: String, updatedUserId: String, apiKey: String): String = """
    {
        "jsonrpc": "$JSONRPC",
        "method": "action.create",
        "params": {
            "name": "$uuid",
            "eventsource": 0,
            "notify_if_canceled": 0,
            "filter": {
                "evaltype": 0,
                "conditions": [
                {
                    "conditiontype": 16,
                    "operator": 11
                },
                {
                    "conditiontype": 26,
                    "operator": 0,
                    "value": "$uuid",
                    "value2": "id"
                }
                ]
            },
            "operations": [
            {
                "operationtype": 0,
                "esc_period": "24h",
                "esc_step_from": 1,
                "esc_step_to": 2,
                "opmessage_usr": [
                {
                    "userid": "$updatedUserId"
                }
                ],
                "opmessage": {
                    "default_msg": 1,
                    "mediatypeid": "1"
                }
            }
            ],
            "recovery_operations": [
            {
                "operationtype": "11",
                "opmessage": {
                    "default_msg": 1
                }
            }
            ]
        },
        "id": 1
    }
""".trimIndent()
