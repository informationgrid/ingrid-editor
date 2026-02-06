/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.opendata.exporter

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.exporter.AddressExport
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.jena.vocabulary.RDFSyntax.doc

class OpenDataRDFTransformer(
    val transformerConfig: OpenDataTransformerConfig,
    val appUrl: String,
    documentsUrl: String,
) {
    val addressExporter = AddressExport(transformerConfig)
    val catalogId = transformerConfig.catalogIdentifier
    val codelistTransformer = transformerConfig.codelists
    val uploadConfig = transformerConfig.uploadConfig
    val documentService = transformerConfig.documentService
    val tags = transformerConfig.tags
    val doc = transformerConfig.doc

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun getRDF(): String {
        val self = this

        return XMLStringOutput2().apply {
            templateEngine.render(
                "export/opendata/rdf-export.jte",
                mapOf(
                    "map" to mapOf(
                        "model" to self,
//                        "catalog" to catalogService.getCatalogById(catalogId),
                    ),
                ),
                this,
            )
        }.toString()
    }

    val uuid = doc.uuid
    val title = doc.title
    val issued = doc.created.toString()
    val modified = doc.modified.toString()
    val description = doc.data.getStringOrEmpty("description")
    val catalog = transformerConfig.catalogService.getCatalogById(transformerConfig.catalogIdentifier)
    val catalogDescription = catalog.description
    val catalogTitle = catalog.name
    val uploadUrl = "$documentsUrl$catalogId/${doc.uuid}"
    val themes = doc.data.get("DCATThemes").map { it.getStringOrEmpty("key") }
    val publisher = doc.data.get("addresses").find { it.getString("type.key") == "10" }?.getStringOrEmpty("ref") ?: ""
    val creator = doc.data.get("addresses").find { it.getString("type.key") == "11" }?.getStringOrEmpty("ref")

    val distributions: List<Distribution> = doc.data.get("distributions")?.map { dist ->
        Distribution(
            accessURL = dist.getStringOrEmpty("link.uri"),
            format = dist.getStringOrEmpty("format.key"),
            title = dist.getStringOrEmpty("title"),
            modified = dist.getStringOrEmpty("modified"),
            description = dist.getStringOrEmpty("description"),
            license = null, // dist.getStringOrEmpty("title"),
            byClause = dist.getStringOrEmpty("byClause"),
            languages = (dist.get("languages") as ArrayNode).map { it.getStringOrEmpty("key") },
            availability = dist.getStringOrEmpty("availability.key"),
        )
    } ?: emptyList()
}

private class XMLStringOutput2 : StringOutput() {
    override fun writeUserContent(value: String?) {
        if (value == null) return
        super.writeUserContent(
            StringEscapeUtils.escapeXml10(value),
//                .replace("\n", "&#10;")
//                .replace("\r", "&#13;")
//                .replace("\t", "&#9;")
        )
    }
}
