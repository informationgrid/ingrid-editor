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
package de.ingrid.igeserver.profiles.ingrid_lubw

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_lubw.importer.ISOImportLUBW
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.CodelistHandler.Companion.toCodelistEntry
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.Permissions
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Lazy
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
@EnableConfigurationProperties(LubwSkdvOkProperties::class)
class LubwProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    isoImport: ISOImport,
    isoImportLUBW: ISOImportLUBW,
    openDataCategory: OpenDataCategory,
    private val authUtils: AuthUtils,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-lubw"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (LUBW)"
    override val parentProfile = "ingrid"

    override val indexExportFormatID = "indexInGridIDFLubw"

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/lubw/default-mapping.json")?.readText() ?: ""

    init {
        isoImport.profileMapper[ID] = isoImportLUBW
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist30000 = createCodelist30000(catalogRef)
        val codelist30001 = createCodelist30001(catalogRef)
        val codelist30002 = createCodelist30002(catalogRef)
        val codelist30003 = createCodelist30003(catalogRef)
        val codelist30004 = createCodelist30004(catalogRef)
        val codelist30005 = createCodelist30005(catalogRef)
        val codelist30006 = createCodelist30006(catalogRef)

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

            "30006" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist30005)
                return
            }

            null -> {
                codelistHandler.removeAndAddCodelists(
                    catalogId,
                    listOf(codelist30000, codelist30001, codelist30002, codelist30003, codelist30004, codelist30005, codelist30006),
                )
            }
        }
        super.initCatalogCodelists(catalogId, codelistId)
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> = if (authUtils.isAuthor(principal)) {
        permissions.filter { it != Permissions.can_create_dataset.name && it != Permissions.can_import.name && it != Permissions.can_create_address.name }
    } else {
        permissions
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
            codelist30003.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
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
            codelist30005.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }

    private fun createCodelist30006(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "30006"
        catalog = catalogRef
        name = "Geometrie - Maßstab"
        description = ""
        defaultEntry = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            codelist30006.forEach { (key, value) ->
                add(toCodelistEntry(key, value))
            }
        }
    }
}
