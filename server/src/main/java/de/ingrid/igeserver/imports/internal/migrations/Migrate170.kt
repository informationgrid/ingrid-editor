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

class Migrate170 {

    companion object {
        fun migrate(documents: JsonNode): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    if (docVersion.has("data") && docVersion.get("data").isObject) {
                        val data = docVersion.get("data") as ObjectNode
                        getProcessingStepsOfDocument(data)?.let { processingSteps ->
                            data.set("processingSteps", processingSteps)
                        }
                    }
                }
            }
            return documents
        }

        fun getProcessingStepsOfDocument(data: ObjectNode): JsonNode? {
            val processingSteps = data.get("processingSteps")?.deepCopy() ?: return null
            if (processingSteps.isArray) {
                processingSteps.forEach { step ->
                    if (step is ObjectNode) {
                        if (step.has("announcementDocsPublishDuringDisclosure")) {
                            step.remove("announcementDocsPublishDuringDisclosure")
                        }

                        val oldKeys = listOf(
                            "applicationDocsPublishDuringDisclosure",
                            "furtherDocsPublishDuringDisclosure",
                            "reportsRecommendationDocsPublishDuringDisclosure",
                        )

                        var anyTrue = false
                        var foundAny = false

                        oldKeys.forEach { key ->
                            if (step.has(key)) {
                                foundAny = true
                                if (step.get(key).asBoolean()) {
                                    anyTrue = true
                                }
                                step.remove(key)
                            }
                        }

                        if (foundAny) {
                            step.put("publishDuringDisclosure", anyTrue)
                        }
                    }
                }
            }
            return processingSteps
        }
    }
}
