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
package de.ingrid.igeserver.profiles.ingrid_hmdk

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_hmdk.importer.ISOImportHMDK
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class HmdkProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportHMDK: ISOImportHMDK,
    @JsonIgnore val behaviourService: BehaviourService
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val id = "ingrid-hmdk"
    }

    override val identifier = id
    override val title = "InGrid Katalog (HMDK)"
    override val parentProfile = "ingrid"


    init {
        isoImport.profileMapper[id] = isoImportHMDK
    }
    override val indexExportFormatID = "indexInGridIDFHmdk"

    override fun initCatalogQueries(catalogId: String) {
        val behaviours = listOf("plugin.publish").map {
            Behaviour().apply {
                name = it
                active = true
                data = mapOf("unpublishDisabled" to true)
            }
        }
        behaviourService.save(catalogId, behaviours)
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelistInformationsgegenstand = createCodelistInformationsgegenstand(catalogRef)
        when (codelistId) {
            "informationsgegenstand" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelistInformationsgegenstand)
                return
            }

            null -> codelistHandler.removeAndAddCodelist(catalogId, codelistInformationsgegenstand)
        }

        super.initCatalogCodelists(catalogId, codelistId)

    }

    private fun createCodelistInformationsgegenstand(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "informationsgegenstand"
            catalog = catalogRef
            name = "Informationsgegenstand"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("hmbtg_01_senatsbeschluss", "Senatsbeschlüsse"))
                add(CodelistHandler.toCodelistEntry("hmbtg_02_mitteilung_buergerschaft", "Mitteilungen des Senats"))
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_03_beschluesse_oeffentliche_sitzung",
                        "Öffentliche Beschlüsse"
                    )
                )
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_04_vertraege_daseinsvorsorge",
                        "Verträge der Daseinsvorsorge"
                    )
                )
                add(CodelistHandler.toCodelistEntry("hmbtg_05_verwaltungsplaene", "Verwaltungspläne"))
                add(CodelistHandler.toCodelistEntry("hmbtg_06_verwaltungsvorschriften", "Verwaltungsvorschriften"))
                add(CodelistHandler.toCodelistEntry("hmbtg_07_statistiken", "Statistiken und Tätigkeitsberichte"))
                add(CodelistHandler.toCodelistEntry("hmbtg_08_gutachten", "Gutachten und Studien"))
                add(CodelistHandler.toCodelistEntry("hmbtg_09_geodaten", "Geodaten"))
                add(CodelistHandler.toCodelistEntry("hmbtg_10_messungen", "Umweltdaten"))
                add(CodelistHandler.toCodelistEntry("hmbtg_11_baumkataster", "Baumkataster"))
                add(CodelistHandler.toCodelistEntry("hmbtg_12_oeffentliche_plaene", "Öffentliche Pläne"))
                add(CodelistHandler.toCodelistEntry("hmbtg_13_baugenehmigungen", "Baugenehmigungen"))
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_14_zuwendungen_subventionen",
                        "Subventionen und Zuwendungen"
                    )
                )
                add(CodelistHandler.toCodelistEntry("hmbtg_15_unternehmensdaten", "Unternehmensdaten"))
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_16_vertraege_oeffentl_interesse",
                        "Verträge von öffentl. Interesse"
                    )
                )
                add(CodelistHandler.toCodelistEntry("hmbtg_17_dienstanweisungen", "Dienstanweisungen"))
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_18_vergleichbar",
                        "vergleichbare Informationen von öffentl. Interesse"
                    )
                )
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_19_andere_veroeffentlichungspflicht",
                        "Veröffentlichungspflicht außerhalb HmbTG"
                    )
                )
                add(
                    CodelistHandler.toCodelistEntry(
                        "hmbtg_20_ohne_veroeffentlichungspflicht",
                        "Ohne gesetzliche Verpflichtung"
                    )
                )
            }

        }
    }
}