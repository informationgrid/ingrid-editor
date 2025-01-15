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
package de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.CodelistHandler.Companion.toCodelistEntry
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class LubwSkdvOkProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-lubw-skdv-ok"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (LUBW SKDV-OK)"
    override val parentProfile = "ingrid"

    override val indexExportFormatID = "indexInGridIDFLubwSkdvOk"

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/lubw/default-mapping.json")?.readText() ?: ""

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist30000 = createCodelist30000(catalogRef)
        val codelist30001 = createCodelist30001(catalogRef)
        val codelist30002 = createCodelist30002(catalogRef)
        val codelist30003 = createCodelist30003(catalogRef)
        val codelist30004 = createCodelist30004(catalogRef)
        val codelist30005 = createCodelist30005(catalogRef)

        when (codelistId) {
            "30000" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30000)
                return
            }

            "30001" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30001)
                return
            }

            "30002" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30002)
                return
            }

            "30003" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30003)
                return
            }

            "30004" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30004)
                return
            }

            "30005" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30005)
                return
            }

            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist30000, codelist30001, codelist30002, codelist30003, codelist30004, codelist30005),
                )
            }
        }
        super.initCatalogCodelists(catalogId, codelistId)
    }

    private fun createCodelist30000(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30000"
        catalog = catalogRef
        name = "Datenführende Stelle"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            codelist30000.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }

    private fun createCodelist30001(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30001"
        catalog = catalogRef
        name = "Produktionsumgebung"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            codelist30001.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }

    private fun createCodelist30002(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30002"
        catalog = catalogRef
        name = "Sachattribute - Gruppe"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            codelist30002.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }

    private fun createCodelist30003(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30003"
        catalog = catalogRef
        name = "Sachattribute - Kategorie"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "Test-Eintrag Kategorie"))
        }
    }

    private fun createCodelist30004(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30004"
        catalog = catalogRef
        name = "Sachattribute - Übermittlungsstufe"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            codelist30004.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }

    private fun createCodelist30005(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30005"
        catalog = catalogRef
        name = "Geometrie - Typ"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(toCodelistEntry("1", "Test-Eintrag Geometrie - Typ"))
        }
    }
}
