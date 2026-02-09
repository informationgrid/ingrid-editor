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
package de.ingrid.igeserver.profiles.opendata.exporter

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.GeneralTransformerConfig
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.output.JsonStringOutput
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

data class OpenDataTransformerConfig(
    override val catalogIdentifier: String,
    override val codelists: CodelistTransformer,
    override val uploadConfig: UploadConfig,
    override val catalogService: CatalogService,
    override val cache: TransformerCache,
    override val doc: Document,
    override val documentService: DocumentService,
    override val tags: List<String>,
) : GeneralTransformerConfig

@Service
class OpenDataExporter(
    val codelistHandler: CodelistHandler,
    val uploadConfig: UploadConfig,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
    val generalProperties: GeneralProperties,
    val openDataRDFExporter: OpenDataRDFExporter,
) : IgeExporter {

    val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override val typeInfo: ExportTypeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexOpenData",
        "Open-Data Index",
        "Export der Datensätze für die weitere Verwendung im InGrid-System.",
        MediaType.APPLICATION_JSON_VALUE,
        "json",
        listOf("opendata", "ingrid-with-opendata"),
        isPublic = true,
        useForPublish = true,
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        if (doc.type == "FOLDER") {
//            val luceneDoc = ingridIndexExporter.run(doc, catalogId, options) as String
//            val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)
//            return luceneJson.toPrettyString()
        }

        val indexDocument = createIndexDocument(doc, catalogId, options)

        return indexDocument.toString()
    }

    private fun createIndexDocument(doc: Document, catalogId: String, options: ExportOptions): TemplateOutput = JsonStringOutput().apply {
        val catalogLanguage = catalogService.getCatalogById(catalogId).settings.config.language ?: "de"
        val codelistTransformer = CodelistTransformer(codelistHandler, catalogId, catalogLanguage)
        val config = OpenDataTransformerConfig(
            catalogId,
            codelistTransformer,
            uploadConfig,
            catalogService,
            TransformerCache(),
            doc,
            documentService,
            options.tags,
        )
        val catalog = catalogService.getCatalogById(catalogId)

        templateEngine.render(
            "export/opendata/lucene-export.jte",
            mapOf(
                "map" to mapOf(
                    "model" to OpenDataModelTransformer(config),
                    "rdf" to openDataRDFExporter.run(doc, catalogId, options),
                    "catalog" to catalogService.getCatalogById(catalogId),
                    "partner" to mapCodelistValue("110", catalog.settings.config.partner),
                    "provider" to mapCodelistValue("111", catalog.settings.config.provider),
                ),
            ),
            this,
        )
    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String = partner?.let { codelistHandler.getCodelistValue(codelistId, it, "ident") } ?: ""
}
