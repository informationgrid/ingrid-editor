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
package de.ingrid.igeserver.profiles.ingrid_krzn

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_krzn.importer.ISOImportKRZN
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class KrznProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportKRZN: ISOImportKRZN,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-krzn"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (KRZN)"
    override val parentProfile = "ingrid"

    override val indexExportFormatID = "indexInGridIDFKrzn"

    init {
        isoImport.profileMapper[ID] = isoImportKRZN
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist10500 = createCodelist10500(catalogRef)
        when (codelistId) {
            "10500" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist10500)
                return
            }
            null -> codelistHandler.removeAndAddCodelist(catalogId, codelist10500)
        }

        super.initCatalogCodelists(catalogId, codelistId)
    }

    private fun createCodelist10500(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "10500"
        catalog = catalogRef
        name = "Alternative Karten-Clients"
        description = ""
        defaultEntry = "1"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("0", "keine Daten im Geoportal"))
            add(CodelistHandler.toCodelistEntry("1", "https://geoportal-niederrhein.de?mdid={ID}"))
            add(CodelistHandler.toCodelistEntry("2", "https://geoportal-niederrhein.de/krefeld/bauenundplanen/?mdid={ID}"))
            add(CodelistHandler.toCodelistEntry("3", "https://geoportal-niederrhein.de/krefeld/natur/?mdid={ID}"))
        }
    }
}
