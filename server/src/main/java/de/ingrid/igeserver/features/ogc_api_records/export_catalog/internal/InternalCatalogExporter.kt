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
package de.ingrid.igeserver.features.ogc_api_records.export_catalog.internal

import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.CatalogExportTypeInfo
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.OgcCatalogExporter
import de.ingrid.igeserver.features.ogc_api_records.model.RecordCollection
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class InternalCatalogExporter(
    @Lazy val documentService: DocumentService,
    val catalogService: CatalogService,
    private val generalProperties: GeneralProperties,
) : OgcCatalogExporter {

    override val typeInfo: CatalogExportTypeInfo
        get() = CatalogExportTypeInfo(
            DocumentCategory.DATA,
            "internal",
            "IGE Catalog in JSON",
            "Interne Datenstruktur des IGE Catalog",
            MediaType.APPLICATION_JSON_VALUE,
            "json",
            listOf(),
        )

    override fun run(catalog: Catalog): RecordCollection = mapCatalogToRecordCollection(catalog)

    private fun mapCatalogToRecordCollection(catalog: Catalog): RecordCollection {
        val apiHost = generalProperties.host
        val links = "$apiHost/api/ogc/collections/${catalog.identifier}/items"
        return RecordCollection(
            id = catalog.identifier,
            title = catalog.name,
            description = catalog.description,
            links = links,
            itemType = "record",
            type = "Collection",
            modelType = catalog.type,
            created = catalog.created,
            updated = catalog.modified,
        )
    }
}
