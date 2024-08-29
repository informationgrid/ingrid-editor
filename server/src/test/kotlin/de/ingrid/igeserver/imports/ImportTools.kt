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
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.utils.getString

fun changeUuidOfOrganisationTo(json: JsonNode, name: String, uuid: String) {
    val addressIndex = json.withIndex().find { it.value.getString("organization") == name }?.index
        ?: throw RuntimeException("Could not replace dynamically generated UUID for $name")

    val oldUuid: String? = json[addressIndex].getString("_uuid")
    (json[addressIndex] as? ObjectNode)?.put("_uuid", uuid)

    if (oldUuid == null) return

    // also update uuid in references
    json[0].get("pointOfContact")
        .filter { it.getString("ref") == oldUuid }
        .forEach { (it as ObjectNode).put("ref", uuid) }

    // Next, update parentAsUuid fields if they match any oldUuid
    json.forEach { item ->
        val parentAsUuid = item.getString("parentAsUuid")
        if (oldUuid == parentAsUuid) {
            (item as? ObjectNode)?.put("parentAsUuid", uuid)
        }
    }
}
