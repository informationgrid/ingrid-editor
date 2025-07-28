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
package de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter

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
import de.ingrid.igeserver.profiles.ingrid.exporter.convertStringToDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.getISOFromElasticDocumentString
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import de.ingrid.utils.xml.ConfigurableNamespaceContext
import de.ingrid.utils.xml.IDFNamespaceContext
import de.ingrid.utils.xml.IgcProfileNamespaceContext
import de.ingrid.utils.xml.XMLUtils
import de.ingrid.utils.xpath.XPathUtils
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridExporterLfub(
    idfExporter: IngridIdfExporterLfub,
    luceneExporter: IngridLuceneExporterLfub,
) : IngridIndexExporter(idfExporter, luceneExporter) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFLfuBayern",
            "Ingrid IDF LfuBayern (Elasticsearch)",
            "Export von Ingrid Dokumenten ins IDF Format für LfuBayern für die Anzeige im Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-lfubayern"),
            isPublic = false,
            useForPublish = true,
        )
}

@Service
class IngridIdfExporterLfub(
    codelistHandler: CodelistHandler,
    uploadConfig: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIDFExporter(codelistHandler, uploadConfig, catalogService, documentService, documentWrapperRepository) {

    private var xpathUtils: XPathUtils

    init {
        val cnc = ConfigurableNamespaceContext()
        cnc.addNamespaceContext(IDFNamespaceContext())
        cnc.addNamespaceContext(IgcProfileNamespaceContext())

        xpathUtils = XPathUtils(cnc)
    }

    override fun getModelTransformerClass(docType: String): KClass<out Any>? = getLfuBayernTransformer(docType) ?: super.getModelTransformerClass(docType)

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        if (doc.type == "FOLDER") return ""

        val idf = super.run(doc, catalogId, options)
        val idfDoc = convertStringToDocument(idf)
        val treePath = lfubGetTreePathNames(documentService, catalogId, doc)
        addPathInfoToMdIdf(idfDoc!!, treePath.joinToString(","))
        return XMLUtils.toString(idfDoc)
    }

    private fun addPathInfoToMdIdf(idf: org.w3c.dom.Document, treePath: String) {
        val idfMdMetadataNode = xpathUtils.getNode(idf, "/idf:html/idf:body/idf:idfMdMetadata")
        if (idfMdMetadataNode != null) {
            val treePathNode = xpathUtils.createElementFromXPath(idfMdMetadataNode, "idf:treePath")
            XMLUtils.createOrReplaceTextNode(
                xpathUtils.createElementFromXPath(treePathNode, "gco:CharacterString"),
                treePath,
            )
        }
    }
}

@Service
class IngridLuceneExporterLfub(
    codelistHandler: CodelistHandler,
    uploadConfig: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridLuceneExporter(
    codelistHandler,
    uploadConfig,
    catalogService,
    documentService,
) {

    override fun getTemplateForDoctype(doc: Document, catalog: Catalog, options: ExportOptions): Pair<String, Map<String, Any>> = when (doc.type) {
        "InGridGeoDataset",
        "InGridGeoService",
        "InGridInformationSystem",
        -> Pair(
            "export/ingrid-lfubayern/lucene/template-lucene-lfubayern.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        else -> super.getTemplateForDoctype(doc, catalog, options)
    }

    override fun getTransformer(data: TransformerData): Any = when (data.type) {
        IngridDocType.DOCUMENT -> {
            getLfuBayernTransformer(data.doc.type)
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
}

@Service
class IngridISOExporterLfub(
    idfExporter: IngridIdfExporterLfub,
    luceneExporter: IngridLuceneExporterLfub,
) : IngridExporterLfub(idfExporter, luceneExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOLfuBayern",
        "ISO 19139 LfuBayern",
        "Export von LfuBayern Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-lfubayern"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        return getISOFromElasticDocumentString(indexString)
    }
}
