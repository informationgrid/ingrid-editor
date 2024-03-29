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
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
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
                getMapper(IngridDocType.DOCUMENT, doc, catalog)
            )

            "InGridGeoDataset" -> Pair("export/ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridPublication" -> Pair("export/ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridGeoService" -> Pair("export/ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridProject" -> Pair("export/ingrid/template-lucene.jte", getMapper(IngridDocType.DOCUMENT, doc, catalog))
            "InGridDataCollection" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog)
            )

            "InGridInformationSystem" -> Pair(
                "export/ingrid/template-lucene.jte",
                getMapper(IngridDocType.DOCUMENT, doc, catalog)
            )

            "InGridOrganisationDoc" -> Pair(
                "export/ingrid/template-lucene-address.jte",
                getMapper(IngridDocType.ADDRESS, doc, catalog)
            )

            "InGridPersonDoc" -> Pair(
                "export/ingrid/template-lucene-address.jte",
                getMapper(IngridDocType.ADDRESS, doc, catalog)
            )

            "FOLDER" -> Pair("export/ingrid/template-lucene-folder.jte", getMapper(IngridDocType.FOLDER, doc, catalog))
            else -> {
                throw ServerException.withReason("Cannot get template for type: ${doc.type}")
            }
        }
    }

    private fun getMapper(type: IngridDocType, doc: Document, catalog: Catalog): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        val codelistTransformer = CodelistTransformer(codelistHandler, catalog.identifier)

        val transformer: Any = getTransformer(type, catalog, codelistTransformer, doc, mapper)

        return mapOf(
            "map" to mapOf(
                "model" to transformer,
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings.config.partner),
                "provider" to mapCodelistValue("111", catalog.settings.config.provider)
            )
        )

    }

    fun getTransformer(
        type: IngridDocType,
        catalog: Catalog,
        codelistTransformer: CodelistTransformer,
        doc: Document,
        mapper: ObjectMapper
    ): Any {
        return when (type) {
            IngridDocType.ADDRESS -> {
                AddressModelTransformer(
                    catalog.identifier,
                    codelistTransformer,
                    null,
                    doc,
                    documentService = documentService
                )
            }

            IngridDocType.DOCUMENT -> {
                IngridModelTransformer(
                    mapper.convertValue(doc, IngridModel::class.java),
                    catalog.identifier,
                    codelistTransformer,
                    config,
                    catalogService, TransformerCache(), doc, documentService
                )
            }

            IngridDocType.FOLDER -> {
                FolderModelTransformer(
                    mapper.convertValue(doc, FolderModel::class.java),
                    catalog.identifier,
                    codelistTransformer
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
