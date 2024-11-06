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
package de.ingrid.igeserver.profiles.ingrid_baw

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_baw.importer.ISOImportBaw
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class BawProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportBaw: ISOImportBaw,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-baw"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (BAW)"
    override val parentProfile = "ingrid"

    init {
        isoImport.profileMapper[ID] = isoImportBaw
    }
    override val indexExportFormatID = "indexInGridIDFBaw"

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        super.initCatalogCodelists(catalogId, codelistId)
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelists = mapOf(
            "3950000" to createCodelistDimensionCode(catalogRef),
            "3950001" to createCodelistModellverfahrenCode(catalogRef),
        )

        if (codelists.containsKey(codelistId)) {
            codelistHandler.removeAndAddCodelist(catalogId, codelists[codelistId]!!)
        } else if (codelistId == null) {
            // remove all codelists and add them again
            codelistHandler.removeAndAddCodelists(catalogId, codelists.values.toList())
        }
    }

    private fun createCodelistDimensionCode(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950000"
        catalog = catalogRef
        name = "BAW_DimensionCode"
        description = "Dimensionalität der numerischen Modelle der BAW"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "1D"))
            add(CodelistHandler.toCodelistEntry("2", "2D"))
            add(CodelistHandler.toCodelistEntry("3", "2D-hor"))
            add(CodelistHandler.toCodelistEntry("4", "2D-vert"))
            add(CodelistHandler.toCodelistEntry("5", "3D"))
            add(CodelistHandler.toCodelistEntry("999", "keine"))
        }
    }

    private fun createCodelistModellverfahrenCode(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "3950001"
        catalog = catalogRef
        name = "BAW_ModellverfahrenCode"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "BSQUAT"))
            add(CodelistHandler.toCodelistEntry("2", "Cascade"))
            add(CodelistHandler.toCodelistEntry("3", "Delft3D 4"))
            add(CodelistHandler.toCodelistEntry("4", "Delft3D FM"))
            add(CodelistHandler.toCodelistEntry("5", "HEC-6T"))
            add(CodelistHandler.toCodelistEntry("6", "Hec-Ras"))
            add(CodelistHandler.toCodelistEntry("7", "Hydro-AS"))
            add(CodelistHandler.toCodelistEntry("8", "k-Modell"))
            add(CodelistHandler.toCodelistEntry("9", "NCAGGREGATE"))
            add(CodelistHandler.toCodelistEntry("10", "NCANALYSE"))
            add(CodelistHandler.toCodelistEntry("11", "NCAUTO"))
            add(CodelistHandler.toCodelistEntry("12", "NCDELTA"))
            add(CodelistHandler.toCodelistEntry("13", "NCPLOT"))
            add(CodelistHandler.toCodelistEntry("14", "OpenFOAM"))
            add(CodelistHandler.toCodelistEntry("15", "PeTra2d"))
            add(CodelistHandler.toCodelistEntry("16", "Rismo2D"))
            add(CodelistHandler.toCodelistEntry("17", "SediMorph"))
            add(CodelistHandler.toCodelistEntry("18", "STAR-CCM+"))
            add(CodelistHandler.toCodelistEntry("19", "Telemac"))
            add(CodelistHandler.toCodelistEntry("20", "UnTRIM"))
            add(CodelistHandler.toCodelistEntry("21", "UnTRIM2007"))
            add(CodelistHandler.toCodelistEntry("22", "UnTRIM2009"))
            add(CodelistHandler.toCodelistEntry("999", "kein"))
            add(CodelistHandler.toCodelistEntry("23", "DuMuˣ"))
        }
    }
}
