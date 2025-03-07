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
package de.ingrid.igeserver.imports.internal.migrations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.utils.getString

class Migrate130 {

    companion object {
        fun migrate(documents: JsonNode): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    migrateReferences(docVersion)
                }
            }
            return documents
        }

        private fun migrateReferences(doc: ObjectNode) {
            val references = doc.get("references")
            if (references == null || references.isNull) return

            references.forEach {
                if (it.getString("referenceType").isNullOrEmpty()) {
                    val isUrl: Boolean = it.getString("url")?.isNotEmpty() ?: false
                    val isUuidRef: Boolean = it.getString("uuidRef")?.isNotEmpty() ?: false

                    val newReferenceType: String? = if (isUrl) {
                        "url"
                    } else if (isUuidRef) {
                        "uuidRef"
                    } else {
                        null
                    }

                    if (!newReferenceType.isNullOrEmpty()) {
                        (it as ObjectNode).apply {
                            put("referenceType", newReferenceType)
                        }
                    }
                }
            }
        }
    }
}
