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

import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("zabbix")
class ZabbixModel {

    data class Host(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: HostParams,
        val auth: String?,
        val id: Int
    )

    data class Webscenario(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: WebscenarioParams,
        val auth: String?,
        val id: Int
    )

    data class Step(
        val name: String,
        val retrieve_mode: Int = 1,
        val url: String,
        val required: String?,
        val status_codes: String,
        val no: Int
    )

    data class Trigger(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: TriggerParams,
        val auth: String?,
        val id: Int
    )

    data class Group(val groupid: String)

    data class Tag(val tag: String, val value: String)

    data class HostParams(
        val host: String,
        val name: String?,
        val groups: List<Group>,
        val tags: List<Tag>?
    )

    data class WebscenarioParams(
        val name: String,
        val hostid: String,
        val delay: String,
        val steps: List<Step>,
        val tags: List<Tag>?
    )

    data class TriggerParams(
        val description: String?,
        val expression: String,
        val priority: Int,
        val status: Int = 0,
        val tags: List<Tag>?
    )

    data class ZabbixData(
        val catalogIdentifier: String,
        val uuid: String,
        val documentTitle: String,
        val documentURL: String,
        val uploads: List<Upload>
    )

    data class Upload(
        val name: String,
        val url: String,
        val webscenarioId: String = ""
    )

    data class Create(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: CreateParams,
        val auth: String?,
        val id: Int
    )

    data class CreateParams(
        val name: String
    )

    data class Delete(
        val jsonrpc: String = JSONRPC,
        val method: String,
        val params: List<String>,
        val auth: String?,
        val id: Int
    )

    data class Problem(
        val eventid: String,
        val objectid: String,
        val clock: String,
        val docName: String,
        val name: String,
        val url: String,
        val docUrl: String,
        val docUuid: String,
    )
}