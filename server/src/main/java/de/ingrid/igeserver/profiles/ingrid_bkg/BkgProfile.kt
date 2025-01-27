/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bkg

import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_bkg.importer.ISOImportBkg
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class BkgProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    @Lazy private val catalogService: CatalogService,
    isoImport: ISOImport,
    isoImportBkg: ISOImportBkg,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-bkg"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (BKG)"
    override val parentProfile = "ingrid"
    override val indexExportFormatID = "indexInGridIDFBkg"

    init {
        isoImport.profileMapper[ID] = isoImportBkg
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        super.initCatalogCodelists(catalogId, codelistId)

        val catalog = catalogService.getCatalogById(catalogId)
        catalog.settings.config.codelistFavorites = mutableMapOf("10003" to listOf("99"))
        catalogService.updateCatalog(catalog)
    }

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/bkg/default-mapping.json")?.readText() ?: ""
}
