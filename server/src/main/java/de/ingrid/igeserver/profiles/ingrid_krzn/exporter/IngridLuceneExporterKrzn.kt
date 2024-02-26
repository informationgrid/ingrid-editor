/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridLuceneExporterKrzn(
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
                val otherTransformer = getKrznTransformer(doc.type)
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

    private fun getKrznTransformer(docType: String): KClass<out Any>? {
        return when(docType) {
            "InGridGeoDataset" -> GeodatasetTransformerKrzn::class
            "InGridGeoService" -> GeoserviceTransformerKrzn::class
            else -> null
        }
    }
}
