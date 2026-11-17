/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import tools.jackson.databind.JsonNode
import tools.jackson.databind.node.ObjectNode

class Migrate160 {

    companion object {
        fun migrate(documents: JsonNode): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    migrateSpatial(docVersion)
                }
            }
            return documents
        }

        fun migrateSpatial(doc: ObjectNode) {
            val spatial = doc.get("spatial") as? ObjectNode ?: return
            val verticalExtent = spatial.get("verticalExtent") as? ObjectNode ?: return
            if (verticalExtent.has("Datum")) {
                verticalExtent.set("spatialSystem", verticalExtent.get("Datum"))
                verticalExtent.remove("Datum")
            }
        }
    }
}
