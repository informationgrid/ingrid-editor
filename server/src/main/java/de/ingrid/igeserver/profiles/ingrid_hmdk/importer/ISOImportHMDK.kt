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
package de.ingrid.igeserver.profiles.ingrid_hmdk.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImportProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ImportProfileData
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData
import de.ingrid.igeserver.services.BwastrLocatorService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.mdek.upload.UploadConfig
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class ISOImportHMDK(val codelistHandler: CodelistHandler, @Lazy val documentService: DocumentService, @Lazy val researchService: ResearchService, @Lazy val bwastrLocatorService: BwastrLocatorService, val uploadConfig: UploadConfig, @Lazy val catalogService: CatalogService) : ISOImportProfile {
    override fun handle(
        catalogId: String,
        data: Metadata,
        addressMaps: MutableMap<String, String>,
    ): ImportProfileData? {
        val catalogLanguage = catalogService.getCatalogById(catalogId).settings.config.language ?: "de"
        val isoData = IsoImportData(data, codelistHandler, catalogId, documentService, addressMaps, researchService, bwastrLocatorService, uploadConfig, catalogLanguage)

        return when (data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "dataset", "series" -> {
                ImportProfileData(
                    "imports/ingrid-hmdk/geodataset.jte",
                    GeodatasetMapperHMDK(isoData),
                )
            }

            "service" -> {
                ImportProfileData(
                    "imports/ingrid-hmdk/geoservice.jte",
                    GeoserviceMapperHMDK(isoData),
                )
            }

            else -> null
        }
    }
}
