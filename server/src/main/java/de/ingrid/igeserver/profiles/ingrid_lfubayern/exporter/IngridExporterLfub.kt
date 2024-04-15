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
package de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.internal.*
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
class IngridExporterLfub(
    idfExporter: IngridIdfExporterLfub,
    luceneExporter: IngridLuceneExporterLfub,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFLfuBayern",
            "Ingrid IDF LfuBayern (Elasticsearch)",
            "Export von Ingrid Dokumenten ins IDF Format für LfuBayern für die Anzeige im Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-lfubayern"),
            isPublic = true,
            useForPublish = true
        )
}

@Service
class IngridIdfExporterLfub(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override fun getModelTransormerClasses(): Map<String, KClass<out Any>> {
        return super.getModelTransormerClasses().toMutableMap().apply {
            put("InGridSpecialisedTask", IngridModelTransformerLfub::class)
            put("InGridGeoDataset", GeodatasetTransformerLfub::class)
            put("InGridPublication", PublicationTransformerLfub::class)
            put("InGridGeoService", GeoserviceTransformerLfub::class)
            put("InGridProject", ProjectTransformerLfub::class)
            put("InGridDataCollection", DataCollectionTransformerLfub::class)
            put("InGridInformationSystem", InformationSystemTransformerLfub::class)
        }
    }
}

@Service
class IngridLuceneExporterLfub(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService
) :
    IngridLuceneExporter(
        codelistHandler,
        config,
        catalogService,
        documentService,
    ) {

    override fun getTransformer(
        type: IngridDocType,
        catalog: Catalog,
        codelistTransformer: CodelistTransformer,
        doc: Document,
        mapper: ObjectMapper
    ): Any {
        return when (type) {
            IngridDocType.DOCUMENT -> {
                val otherTransformer = getTransformer(doc.type)
                otherTransformer
                    ?.constructors
                    ?.first()
                    ?.call(
                        mapper.convertValue(doc, IngridModel::class.java),
                        catalog.identifier,
                        codelistTransformer,
                        config,
                        catalogService,
                        TransformerCache(),
                        doc,
                        documentService
                    ) ?: super.getTransformer(type, catalog, codelistTransformer, doc, mapper)
            }

            else -> super.getTransformer(type, catalog, codelistTransformer, doc, mapper)
        }
    }

    private fun getTransformer(docType: String): KClass<out Any>? {
        return when (docType) {
            "InGridSpecialisedTask" -> IngridModelTransformerLfub::class
            "InGridGeoDataset" -> GeodatasetTransformerLfub::class
            "InGridPublication" -> PublicationTransformerLfub::class
            "InGridGeoService" -> GeoserviceTransformerLfub::class
            "InGridProject" -> ProjectTransformerLfub::class
            "InGridDataCollection" -> DataCollectionTransformerLfub::class
            "InGridInformationSystem" -> InformationSystemTransformerLfub::class
            else -> null
        }
    }
}
