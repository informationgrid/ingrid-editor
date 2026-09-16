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

import de.ingrid.igeserver.utils.getString
import tools.jackson.databind.JsonNode
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

class Migrate120 {

    companion object {
        private val includedTypes = listOf(
            "InGridGeoDataset",
            "InGridDataCollection",
            "InGridGeoService",
            "InGridInformationSystem",
            "InGridPublication",
            "InGridProject",
            "InGridSpecialisedTask",
        )

        fun migrate(documents: JsonNode, profile: String): JsonNode {
            listOf("draft", "published").forEach { type ->
                documents.get(type)?.let { docVersion ->
                    docVersion as ObjectNode
                    val docType = docVersion.getString("_type")!!
                    if (includedTypes.contains(docType)) {
                        val migratedData = getPropertiesOfDocument(docVersion, docType)
                        docVersion.set("properties", migratedData)
                    }
                }
            }
            return documents
        }

        fun getPropertiesOfDocument(doc: ObjectNode, docType: String): JsonNode = jacksonObjectMapper().createObjectNode().apply {
            val isOpenData = doc.remove("isOpenData")
            val isAdVCompatible = doc.remove("isAdVCompatible")
            val isInspireIdentified = doc.remove("isInspireIdentified")
            val subType = doc.remove("subType")
            val isInspireConform = doc.remove("isInspireConform")
            val hvd = doc.remove("hvd")
            val publicationHmbTG = doc.remove("publicationHmbTG")

            if (publicationHmbTG?.booleanValue() == true) set("publicationHmbTG", publicationHmbTG)
            if (isOpenData?.booleanValue() == true) set("isOpenData", isOpenData)
            if (isAdVCompatible?.booleanValue() == true) set("isAdVCompatible", isAdVCompatible)
            if (isInspireIdentified?.booleanValue() == true) {
                if (docType == "InGridGeoDataset") {
                    if (isInspireConform == null || isInspireConform.isNull || !isInspireConform.booleanValue()) {
                        put("isInspireIdentified", "notConform")
                    } else {
                        put("isInspireIdentified", "conform")
                    }
                    val invekos = doc.remove("invekos")
                    if (invekos?.isNull == false && invekos.getString("key") != "none") {
                        set("invekos", invekos)
                    }
                } else {
                    put("isInspireIdentified", "relevant")
                }
            }
            if (subType?.isNull == false) set("subType", subType)
            if (hvd?.booleanValue() == true) set("isHvd", hvd)
        }
    }
}
