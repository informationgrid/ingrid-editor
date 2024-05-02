/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.utils.getString

fun changeUuidOfOrganisationTo(json: JsonNode, name: String, uuid: String) {
    val contacts = json.get("pointOfContact") as? ArrayNode ?: return
    var oldUuid: String? = null

    // First, find and update the uuids for matching organizations
    contacts.forEach { item ->
        val orgNode = item.getString("ref.organization")
        if (orgNode == name) {
            oldUuid = item.getString("ref._uuid")
            (item.get("ref") as? ObjectNode)?.put("_uuid", uuid)
        }
    }

    if (oldUuid == null) return
    // Next, update parentAsUuid fields if they match any oldUuid
    contacts.forEach { item ->
        val parentAsUuid = item.getString("ref.parentAsUuid")
        if (oldUuid == parentAsUuid) {
            (item.get("ref") as? ObjectNode)?.put("parentAsUuid", uuid)
        }
    }
}