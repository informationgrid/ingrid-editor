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
package de.ingrid.igeserver.profiles.ingrid_with_opendata

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.opendata.OpenDataProfile
import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataLuceneExporter
import de.ingrid.igeserver.profiles.opendata.types.OpenDataType
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class InGridWithOpendataProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    @JsonIgnore @Qualifier("openDataProfile") val opendataProfile: OpenDataProfile,
    @JsonIgnore val openDataType: OpenDataType,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-with-opendata"
    }

    override val identifier = ID
    override val title = "InGrid mit Opendata - Katalog"
    override val parentProfile = "ingrid"

//    override val indexExportFormatID = "indexInGridIDFKrzn"

    init {
//        openDataType.profiles = emptyList<>()
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
//        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        opendataProfile.initCatalogCodelists(catalogId, codelistId)

        super.initCatalogCodelists(catalogId, codelistId)
    }
}
