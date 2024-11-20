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
package de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.getISOFromElasticDocumentString
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class IngridExporterLubwSkdvOk(
    @Qualifier("ingridIDFExporter") idfExporter: IngridIDFExporter,
    @Qualifier("ingridLuceneExporter") luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFLubwSkdvOk",
            "Portal (LUBW SKDV-OK)",
            "Export von Ingrid Dokumenten ins IDF Format für LUBW SKDV-OK für die Anzeige im internen Portal.",
            "application/json",
            "json",
            listOf("ingrid-lubw-skdv-ok"),
            isPublic = true,
            useForPublish = true,
        )
}

@Service
class IngridIdfExporterLubwSkdvOk(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDFLubwSkdvOk",
        "Ingrid IDF LUBW SKDV-OK",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid-lubw-skdv-ok"),
    )

/*
    override fun getModelTransformerClass(docType: String): KClass<out Any>? =
        getSkdvOkTransformer(docType) ?: super.getModelTransformerClass(docType)
*/
}

/*
@Service
class IngridLuceneExporterSkdvOk(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridLuceneExporter(
    codelistHandler,
    config,
    catalogService,
    documentService,
) {

    override fun getTransformer(data: TransformerData): Any = when (data.type) {
        IngridDocType.DOCUMENT -> {
            IngridModelTransformerSkdvOk(
                TransformerConfig(
                    data.mapper.convertValue(data.doc, IngridModel::class.java),
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    config,
                    catalogService,
                    TransformerCache(),
                    data.doc,
                    documentService,
                    data.tags,
                ),
            )
        }

        else -> super.getTransformer(data)
    }

    override fun getTemplateForDoctype(
        doc: Document,
        catalog: Catalog,
        options: ExportOptions,
    ): Pair<String, Map<String, Any>> = when (doc.type) {
        "InGridGeoDataset",
        -> Pair(
            "export/ingrid-bast/lucene/template-lucene-bast.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        else -> super.getTemplateForDoctype(doc, catalog, options)
    }
}
*/

@Service
class IngridISOExporterLubwSkdvOk(
    idfExporter: IngridIdfExporterLubwSkdvOk,
//    luceneExporter: IngridLuceneExporterSkdvOk,
    @Qualifier("ingridLuceneExporter") luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridExporterLubwSkdvOk(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOLubwSkdvOk",
        "ISO 19139 LUBW SKDV-OK",
        "Export von LUBW SKDV-OK Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-lubw-skdv-ok"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        return getISOFromElasticDocumentString(indexString)
    }
}
