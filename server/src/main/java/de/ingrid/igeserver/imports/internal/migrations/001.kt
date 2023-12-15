/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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