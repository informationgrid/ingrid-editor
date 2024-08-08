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
package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.FolderModelTransformer
import de.ingrid.igeserver.exporter.model.FolderModel
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter.IngridDocType
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class IngridLuceneExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService
) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val output: TemplateOutput = JsonStringOutput()
        handleFoldersWithoutPublishedChildren(doc)
        val catalog = catalogService.getCatalogById(catalogId)
        val templateData = getTemplateForDoctype(doc, catalog, options)
        templateEngine.render(templateData.first, templateData.second, output)
        // fix strings that actually should represent JSON (like wkt_geo-field)
        return output.toString().replace("@json@", "\"")
    }

    private fun handleFoldersWithoutPublishedChildren(doc: Document) {
        if (doc.type == "FOLDER") {
            val children = documentService.docWrapperRepo.findByParentIdAndPublished(doc.wrapperId!!)
            if (children.isEmpty()) throw IndexException.folderWithNoPublishedDocs(doc.uuid)
        }
    }

    fun getTemplateForDoctype(doc: Document, catalog: Catalog, options: ExportOptions): Pair<String, Map<String, Any>> {
        return when (doc.type) {
            "InGridSpecialisedTask" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridGeoDataset" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridPublication" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridGeoService" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridProject" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridDataCollection" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridInformationSystem" -> Pair(
                "export/ingrid/lucene/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog, options)
            )

            "InGridOrganisationDoc" -> Pair(
                "export/ingrid/lucene/template-lucene-address.jte",
                getMapper(IngridDocType.ADDRESS, doc, catalog, options)
            )

            "InGridPersonDoc" -> Pair(
                "export/ingrid/lucene/template-lucene-address.jte",
                getMapper(IngridDocType.ADDRESS, doc, catalog, options)
            )

            "FOLDER" -> Pair(
                "export/ingrid/lucene/template-lucene-folder.jte",
                getMapper(IngridDocType.FOLDER, doc, catalog, options)
            )

            else -> {
                throw ServerException.withReason("Cannot get template for type: ${doc.type}")
            }
        }
    }

    fun getMapper(type: IngridDocType, doc: Document, catalog: Catalog, options: ExportOptions): Map<String, Any> {

        val codelistTransformer = CodelistTransformer(codelistHandler, catalog.identifier)
        val data = TransformerData(type, catalog.identifier, codelistTransformer, doc, options.tags)

        val transformer: Any = getTransformer(data)

        return mapOf(
            "map" to mapOf(
                "model" to transformer,
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings.config.partner),
                "provider" to mapCodelistValue("111", catalog.settings.config.provider)
            )
        )

    }

    fun getTransformer(data: TransformerData): Any {
        return when (data.type) {
            IngridDocType.ADDRESS -> {
                AddressModelTransformer(
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    null,
                    data.doc,
                    documentService = documentService
                )
            }

            IngridDocType.DOCUMENT -> {
                IngridModelTransformer(
                    TransformerConfig(
                        data.mapper.convertValue(data.doc, IngridModel::class.java),
                        data.catalogIdentifier,
                        data.codelistTransformer,
                        config,
                        catalogService,
                        TransformerCache(),
                        data.doc,
                        documentService,
                        data.tags
                    )
                )
            }

            IngridDocType.FOLDER -> {
                FolderModelTransformer(
                    data.mapper.convertValue(data.doc, FolderModel::class.java),
                    data.catalogIdentifier,
                    data.codelistTransformer
                )
            }
        }
    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String {
        return partner?.let { codelistHandler.getCodelistValue(codelistId, it, "ident") } ?: ""
    }

    class JsonStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                JsonEscape.escapeJson(value)
            )
        }
    }

    enum class IngridDocType {
        ADDRESS, DOCUMENT, FOLDER
    }
}

data class TransformerData(
    val type: IngridDocType,
    val catalogIdentifier: String,
    val codelistTransformer: CodelistTransformer,
    val doc: Document,
    val tags: List<String>,
    val mapper: ObjectMapper = ObjectMapper().registerKotlinModule()
)
