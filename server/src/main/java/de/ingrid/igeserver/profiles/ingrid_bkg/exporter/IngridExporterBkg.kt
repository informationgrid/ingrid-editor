/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridISOExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerData
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridExporterBkg(
    idfExporter: IngridIdfExporterBkg,
    luceneExporter: IngridLuceneExporterBkg,
) : IngridIndexExporter(idfExporter, luceneExporter) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFBkg",
            "Export Portal BKG",
            "Export von Ingrid Dokumenten ins IDF Format für BKG für die Anzeige im Portal.",
            "application/json",
            "json",
            listOf("ingrid-bkg"),
            isPublic = true,
            useForPublish = true,
        )
}

@Service
class IngridIdfExporterBkg(
    codelistHandler: CodelistHandler,
    config: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDFBkg",
        "Ingrid IDF BKG",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid-bkg"),
    )

    override fun getModelTransformerClass(docType: String): KClass<out Any>? = getBkgTransformer(docType) ?: super.getModelTransformerClass(docType)
}

@Service
class IngridLuceneExporterBkg(
    codelistHandler: CodelistHandler,
    config: UploadConfig,
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
            getBkgTransformer(data.doc.type)
                ?.constructors
                ?.first()
                ?.call(
                    TransformerConfig(
                        data.mapper.convertValue(data.doc, IngridModel::class.java),
                        data.catalogIdentifier,
                        data.codelistTransformer,
                        uploadConfig,
                        catalogService,
                        TransformerCache(),
                        data.doc,
                        documentService,
                        data.tags,
                    ),
                ) ?: super.getTransformer(data)
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
            "export/ingrid-bkg/lucene/template-lucene-geodataset-bkg.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        else -> super.getTemplateForDoctype(doc, catalog, options)
    }
}

@Service
class IngridISOExporterBkg(
    idfExporter: IngridIdfExporterBkg,
) : IngridISOExporter(idfExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOBkg",
        "ISO 19139 Bkg",
        "Export von BKG Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-bkg"),
    )
}
