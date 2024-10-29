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
package de.ingrid.igeserver.imports.internal.migrations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.utils.getString

class Migrate120 {

    companion object {
        fun migrate(documents: JsonNode, profile: String): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    val migratedData = getPropertiesOfDocument(docVersion)
                    docVersion.set<JsonNode>("properties", migratedData)
                }
            }
            return documents
        }

        fun getPropertiesOfDocument(doc: ObjectNode): JsonNode = jacksonObjectMapper().createObjectNode().apply {
            val isOpenData = doc.remove("isOpenData")
            val isAdVCompatible = doc.remove("isAdVCompatible")
            val isInspireIdentified = doc.remove("isInspireIdentified")
            val subType = doc.remove("subType")
            val isInspireConform = doc.remove("isInspireConform")
            val hvd = doc.remove("hvd")

            if (isOpenData?.booleanValue() == true) set<JsonNode>("isOpenData", isOpenData)
            if (isAdVCompatible?.booleanValue() == true) set<JsonNode>("isAdVCompatible", isAdVCompatible)
            if (isInspireIdentified?.booleanValue() == true) {
                if (doc.getString("_type") == "InGridGeoDataset") {
                    if (isInspireConform?.isNull == true || !isInspireConform.booleanValue()) {
                        put("isInspireIdentified", "notConform")
                    } else {
                        put("isInspireIdentified", "conform")
                    }
                    val invekos = doc.remove("invekos")
                    if (invekos?.isNull == false && invekos.getString("key") != "none") {
                        set<JsonNode>("invekos", invekos)
                    }
                } else {
                    put("isInspireIdentified", "relevant")
                }
            }
            if (subType?.isNull == false) set<JsonNode>("subType", subType)
            if (hvd?.booleanValue() == true) set<JsonNode>("isHvd", hvd)
        }
    }
}
