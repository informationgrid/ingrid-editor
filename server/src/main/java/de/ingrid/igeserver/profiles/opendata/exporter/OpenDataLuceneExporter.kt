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
package de.ingrid.igeserver.profiles.opendata.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.FolderModelTransformer
import de.ingrid.igeserver.exporter.model.FolderModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
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
class OpenDataLuceneExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService
) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = JsonStringOutput()
        handleFoldersWithoutPublishedChildrens(doc)
        val catalog = catalogService.getCatalogById(catalogId)
        val templateData = getTemplateForDoctype(doc, catalog)
        templateEngine.render(templateData.first, templateData.second, output)
        // fix strings that actually should represent JSON (like wkt_geo-field)
        return output.toString().replace("@json@", "\"")
    }

    private fun handleFoldersWithoutPublishedChildrens(doc: Document) {
        if (doc.type == "FOLDER") {
            val children = documentService.docWrapperRepo.findByParentIdAndPublished(doc.wrapperId!!)
            if (children.isEmpty()) throw IndexException.folderWithNoPublishedDocs(doc.uuid)
        }
    }

    private fun getTemplateForDoctype(doc: Document, catalog: Catalog): Pair<String, Map<String, Any>> {
        return when (doc.type) {
            "InGridSpecialisedTask" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridGeoDataset" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridPublication" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridGeoService" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridProject" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridDataCollection" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridInformationSystem" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(OpenDataDocType.DOCUMENT, doc, catalog)
            )

            "InGridOrganisationDoc" -> Pair(
                "export/ingrid/template-lucene-address.jte",
                getMapper(OpenDataDocType.ADDRESS, doc, catalog)
            )

            "InGridPersonDoc" -> Pair(
                "export/ingrid/template-lucene-address.jte",
                getMapper(OpenDataDocType.ADDRESS, doc, catalog)
            )

            "FOLDER" -> Pair("export/ingrid/template-lucene-folder.jte", getMapper(OpenDataDocType.FOLDER, doc, catalog))
            else -> {
                throw ServerException.withReason("Cannot get template for type: ${doc.type}")
            }
        }
    }

    private fun getMapper(type: OpenDataDocType, doc: Document, catalog: Catalog): Map<String, Any> {

        val codelistTransformer = CodelistTransformer(codelistHandler, catalog.identifier)
        val data = TransformerData(type, catalog.identifier, codelistTransformer, doc)

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
            OpenDataDocType.ADDRESS -> {
                AddressModelTransformer(
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    null,
                    data.doc,
                    documentService = documentService
                )
            }

            OpenDataDocType.DOCUMENT -> {
                IngridModelTransformer(
                    TransformerConfig(
                        data.mapper.convertValue(data.doc, IngridModel::class.java),
                        data.catalogIdentifier,
                        data.codelistTransformer,
                        config,
                        catalogService, TransformerCache(), data.doc, documentService
                    )
                )
            }

            OpenDataDocType.FOLDER -> {
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

    enum class OpenDataDocType {
        ADDRESS, DOCUMENT, FOLDER
    }
}

data class TransformerData(
    val type: OpenDataLuceneExporter.OpenDataDocType,
    val catalogIdentifier: String,
    val codelistTransformer: CodelistTransformer,
    val doc: Document,
    val mapper: ObjectMapper = ObjectMapper().registerKotlinModule()
)
