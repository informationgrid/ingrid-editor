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
package de.ingrid.igeserver.profiles.ingrid_lfubayern

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_lfubayern.importer.ISOImportLfUBayern
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class LfuBayernProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportLfUBayern: ISOImportLfUBayern,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val id = "ingrid-lfubayern"
    }

    override val identifier = id
    override val title = "InGrid Katalog (LfU Bayern)"
    override val parentProfile = "ingrid"

    override val indexExportFormatID = "IngridIndexExporterLfub"

    init {
        isoImport.profileMapper[id] = isoImportLfUBayern
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        super.initCatalogCodelists(catalogId, codelistId)

        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist20000 = Codelist().apply {
            identifier = "20000"
            catalog = catalogRef
            name = "Geologische Schlüsselliste"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
//                CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22")
            }
        }
        val codelist20001 = Codelist().apply {
            identifier = "20001"
            catalog = catalogRef
            name = "Interne Schlüsselwörter"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
//                CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22")
            }
        }
        val codelist20002 = Codelist().apply {
            identifier = "20002"
            catalog = catalogRef
            name = "Anwendungsprofil"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Anwendungs-URL"))
                add(CodelistHandler.toCodelistEntry("2", "Bestellung"))
                add(CodelistHandler.toCodelistEntry("3", "Download"))
                add(CodelistHandler.toCodelistEntry("4", "GDS"))
                add(CodelistHandler.toCodelistEntry("5", "GISterm"))
                add(CodelistHandler.toCodelistEntry("6", "Information"))
                add(CodelistHandler.toCodelistEntry("7", "Kontakt"))
                add(CodelistHandler.toCodelistEntry("8", "WFS-URL"))
                add(CodelistHandler.toCodelistEntry("9", "WMS-URL"))
                add(CodelistHandler.toCodelistEntry("10", "Feed-URL"))
            }
        }

        when (codelistId) {
            "20000" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20000)
            "20001" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20001)
            "20002" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20002)
            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist20000, codelist20001, codelist20002)
                )
            }
        }
    }

}