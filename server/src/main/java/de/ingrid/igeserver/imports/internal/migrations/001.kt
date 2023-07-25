package de.ingrid.igeserver.imports.internal.migrations

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.services.FIELD_ID
import de.ingrid.igeserver.services.FIELD_UUID

class Migrate001 {

    companion object {
        fun migrate(documents: ArrayNode): ArrayNode {
            documents.forEach { document ->
                document as ObjectNode
                document.put(FIELD_UUID, document.get(FIELD_ID).asText())
                val addresses = document.get("addresses") as ArrayNode
                addresses.forEach { address ->
                    val ref = (address as ObjectNode).get("ref") as ObjectNode
                    ref.put(FIELD_UUID, ref.get(FIELD_ID).asText())
                }
            }

            return documents
        }
    }
}