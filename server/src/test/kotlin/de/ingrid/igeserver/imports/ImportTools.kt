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