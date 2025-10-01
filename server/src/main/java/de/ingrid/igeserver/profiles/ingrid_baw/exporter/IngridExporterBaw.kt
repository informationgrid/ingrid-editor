/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw.exporter

import de.ingrid.igeserver.exporter.AddressTransformerConfig
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
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.AddressModelTransformerBaw
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
class IngridExporterBaw(
    idfExporter: IngridIdfExporterBaw,
    luceneExporter: IngridLuceneExporterBaw,
) : IngridIndexExporter(idfExporter, luceneExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDFBaw",
        "Ingrid IDF BAW Datenfinder (Elasticsearch)",
        "Export von Ingrid Dokumenten ins IDF Format für BAW für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid-baw"),
        isPublic = true,
        useForPublish = true,
    )
}

@Service
class IngridExporterBawRepository(
    idfExporter: IngridIdfExporterBaw,
    luceneExporter: IngridLuceneExporterBaw,
) : IngridExporterBaw(idfExporter, luceneExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDFBawRepository",
        "Ingrid IDF BAW Datenrepository (Elasticsearch)",
        "Export von BAW Dokumenten in das Datenrepository",
        "application/json",
        "json",
        listOf("ingrid-baw"),
        isPublic = true,
        useForPublish = true,
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        options.tags += "forRepository"
        return super.run(doc, catalogId, options)
    }
}

@Service
class IngridIdfExporterBaw(
    codelistHandler: CodelistHandler,
    config: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService, documentWrapperRepository) {

    override fun getModelTransformerClass(docType: String): KClass<out Any>? = getBawModelTransformerClass(docType) ?: super.getModelTransformerClass(docType)

    override fun getTemplateForDoctype(type: String): String = getBawTemplateForDocType(type) ?: super.getTemplateForDoctype(type)

    override fun isAddress(json: Document): Boolean = json.type == "PublicationAddressDoc" || super.isAddress(json)
}

@Service
class IngridLuceneExporterBaw(
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
        IngridDocType.ADDRESS -> {
            AddressModelTransformerBaw(
                AddressTransformerConfig(
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    null,
                    data.doc,
                    documentService = documentService,
                    uploadConfig = uploadConfig,
                    data.tags,
                ),
            )
        }
        IngridDocType.DOCUMENT -> {
            getBawModelTransformerClass(data.doc.type)
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
        "PublicationAddressDoc" -> Pair(
            "export/ingrid/lucene/template-lucene-address.jte",
            getMapper(IngridDocType.ADDRESS, doc, catalog, options),
        )
        "InGridProject",
        -> Pair(
            "export/ingrid-baw/lucene/template-lucene-baw-project.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )
        "InGridGeoDataset",
        "BawMeasurement",
        "BawSimulation",
        -> Pair(
            "export/ingrid-baw/lucene/template-lucene-baw-geodataset.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )
        "InGridGeoService",
        "BawPublication",
        -> Pair(
            "export/ingrid-baw/lucene/template-lucene-baw.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )
        else -> super.getTemplateForDoctype(doc, catalog, options)
    }
}

@Service
class IngridISOExporterBaw(
    idfExporter: IngridIdfExporterBaw,
) : IngridISOExporter(idfExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOBaw",
        "ISO 19139 BAW",
        "Export von BAW Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-baw"),
    )
}
