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
package de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer

import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.amendLubwDescriptiveKeywords
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.getEnvironmentDescription
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import tools.jackson.databind.node.ArrayNode

class GeodatasetTransformerLubw(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {

    private val docData = doc.data
    private val codelist = transformerConfig.codelists

    override val systemEnvironment =
        if (!super.systemEnvironment.isNullOrEmpty()) {
            super.systemEnvironment
        } else {
            getEnvironmentDescription(docData, transformerConfig.codelists)
        }

    override fun getDescriptiveKeywords(): List<Thesaurus> = amendLubwDescriptiveKeywords(docData, super.getDescriptiveKeywords())

    // if the document has access constraints other than "1" ("Es gelten keine Zugriffsbeschränkungen") #4377 #7280
    override fun hasAccessConstraints(): Boolean = data.resource?.accessConstraints?.any { it.key != "1" } == true

    fun getObjectAttributes(): List<Attribute> {
        val attributes: ArrayNode? = doc.data.getPath("featureCatalogueDescription.objectAttributes") as ArrayNode?
        return attributes
            ?.filter { it.getString("transmissionLevel.key") in setOf("0", "1") }
            ?.map {
                Attribute(
                    group = codelist.codelistHandler.getCatalogCodelistValue(
                        transformerConfig.catalogIdentifier,
                        "30002",
                        it.getString("group.key")!!,
                    )!!,
                    category = codelist.codelistHandler.getCatalogCodelistValue(
                        transformerConfig.catalogIdentifier,
                        "30003",
                        it.getString("category.key")!!,
                    )!!,
                    description = it.getStringOrEmpty("description"),
                    designation = it.getStringOrEmpty("designation"),
                    transmissionLevel = codelist.codelistHandler.getCatalogCodelistValue(
                        transformerConfig.catalogIdentifier,
                        "30004",
                        it.getString("transmissionLevel.key")!!,
                    )!!,
                )
            } ?: emptyList()
    }
}

data class Attribute(
    val group: String,
    val category: String,
    val description: String,
    val designation: String,
    val transmissionLevel: String,
)
