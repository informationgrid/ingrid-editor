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
package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.*
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
class IngridExporterKrzn(
    idfExporter: IngridIdfExporterKrzn,
    luceneExporter: IngridLuceneExporterKrzn,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFKrzn",
            "Ingrid IDF KRZN (Elasticsearch)",
            "Export von Ingrid Dokumenten ins IDF Format für KRZN für die Anzeige im Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-krzn"),
            isPublic = true,
            useForPublish = true,
        )
}

@Service
class IngridIdfExporterKrzn(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override fun getModelTransformerClass(docType: String): KClass<out Any>? = getKrznTransformer(docType) ?: super.getModelTransformerClass(docType)
}

@Service
class IngridLuceneExporterKrzn(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) :
    IngridLuceneExporter(
        codelistHandler,
        config,
        catalogService,
        documentService,
    ) {

    override fun getTransformer(data: TransformerData): Any {
        return when (data.type) {
            IngridDocType.DOCUMENT -> {
                getKrznTransformer(data.doc.type)
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
    }
}

@Service
class IngridISOExporterKrzn(
    idfExporter: IngridIdfExporterKrzn,
    luceneExporter: IngridLuceneExporterKrzn,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridExporterKrzn(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOKrzn",
        "ISO 19139 KRZN",
        "Export von KRZN Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-krzn"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        return getISOFromElasticDocumentString(indexString)
    }
}
