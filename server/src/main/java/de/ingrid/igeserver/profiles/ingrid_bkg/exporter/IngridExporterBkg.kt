package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerData
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.getISOFromElasticDocumentString
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridExporterBkg(
    idfExporter: IngridIdfExporterBkg,
    luceneExporter: IngridLuceneExporterBkg,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFBkg",
            "Internes Portal (BKG)",
            "Export von Ingrid Dokumenten ins IDF Format für BKG für die Anzeige im internen Portal.",
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
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDFBkg",
        "Ingrid IDF BKG",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid-bkg"),
    )

    override fun getModelTransformerClass(docType: String): KClass<out Any>? =
        getBkgTransformer(docType) ?: super.getModelTransformerClass(docType)
}

@Service
class IngridLuceneExporterBkg(
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
            getBkgTransformer(data.doc.type)
                ?.constructors
                ?.first()
                ?.call(
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
                ) ?: super.getTransformer(data)
        }

        else -> super.getTransformer(data)
    }

    override fun getTemplateForDoctype(
        doc: Document,
        catalog: Catalog,
        options: ExportOptions,
    ): Pair<String, Map<String, Any>> = when (doc.type) {
        /*"InGridGeoDataset",
        "InGridGeoService",
        "InGridDataCollection",
        -> Pair(
            "export/ingrid-bkg/lucene/template-lucene-bkg.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )*/

        else -> super.getTemplateForDoctype(doc, catalog, options)
    }
}

@Service
class IngridISOExporterBkg(
    idfExporter: IngridIdfExporterBkg,
    luceneExporter: IngridLuceneExporterBkg,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridExporterBkg(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOBkg",
        "ISO 19139 Bkg",
        "Export von BKG Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-bkg"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        return getISOFromElasticDocumentString(indexString)
    }
}
