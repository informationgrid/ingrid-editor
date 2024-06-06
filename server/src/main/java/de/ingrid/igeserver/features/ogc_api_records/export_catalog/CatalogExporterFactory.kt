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
package de.ingrid.igeserver.features.ogc_api_records.export_catalog

import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.stereotype.Service

@Service
class OgcCatalogExporterFactory(private val catalogExporterList: List<OgcCatalogExporter>) {
    val typeInfos: List<CatalogExportTypeInfo> = catalogExporterList.map { exporter: OgcCatalogExporter -> exporter.typeInfo }

    fun getExporter(format: de.ingrid.igeserver.features.ogc_api_records.api.CollectionFormat): OgcCatalogExporter {
        try {
            return catalogExporterList.first { exporter: OgcCatalogExporter -> format.toString() == exporter.typeInfo.type }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("No exporter found for format '$format'.")
        }
    }
}