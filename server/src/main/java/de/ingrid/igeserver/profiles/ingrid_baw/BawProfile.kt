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
package de.ingrid.igeserver.profiles.ingrid_baw

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_baw.importer.ISOImportBaw
import de.ingrid.igeserver.profiles.ingrid_baw.quickfilter.DocumentTypesBaw
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.BehaviourService
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
    @JsonIgnore val behaviourService: BehaviourService,
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

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/ingrid/mappings/baw/default-mapping.json")?.readText() ?: ""

    override val indexExportFormatID = "indexInGridIDFBaw"
    private val boundingBoxGermany = """{ "lat1": 47.2701114, "lon1": 5.8663153, "lat2": 55.099161, "lon2": 15.0419309 }"""

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = super.getFacetDefinitionsForDocuments().map { if (it.id == "docType") bawTypeFacetGroup else it }.toTypedArray()

    val bawTypeFacetGroup = FacetGroup(
        "docType",
        "Datensatztyp",
        arrayOf(
            DocumentTypesBaw(),
        ),
        viewComponent = ViewComponent.SELECT,
    )

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelists = mapOf(
            "identifierType" to createCodelistIdentifierType(catalogRef),
            "verticalSpatialSystems" to createCodelistVerticalSpatialSystems(catalogRef),
            "bwastrids" to createBwaStrIds(catalogRef),
        )

        if (codelists.containsKey(codelistId)) {
            codelistHandler.removeAndAddCodelist(catalogId, codelists[codelistId]!!)
        } else if (codelistId == null) {
            // remove all codelists and add them again
            codelistHandler.removeAndAddCodelists(catalogId, codelists.values.toList())
            super.initCatalogCodelists(catalogId, null)
        } else {
            super.initCatalogCodelists(catalogId, codelistId)
        }
    }

    override fun initCatalogQueries(catalogId: String) {
        val behaviours = listOf(
            Behaviour().apply {
                name = "plugin.publish"
                active = true
                data = mapOf("unpublishDisabled" to true)
                // set DOI active
            },
            Behaviour().apply {
                name = "plugin.ingrid.doi"
                active = true
                data = emptyMap<String, Any?>()
            },
        )
        behaviourService.save(catalogId, behaviours)
    }

    private fun createBwaStrIds(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "bwastrids"
        catalog = catalogRef
        name = "Bundeswasserstraßen-IDs"
        description = "Zusätzliche IDs, die nicht im BWaStr. Locator vorhanden sind"
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("7000", "Nordsee", """{ "lat1": 53.28, "lon1": 3.34, "lat2": 56.04, "lon2": 9.05 }"""))
            add(CodelistHandler.toCodelistEntry("8000", "Ostsee", """{ "lat1": 53.68, "lon1": 9.41, "lat2": 55.11, "lon2": 14.82 }"""))
            add(CodelistHandler.toCodelistEntry("8300", "Ryck"))
            add(CodelistHandler.toCodelistEntry("9600", "Binnenwasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9700", "Seewasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9800", "Bundeswasserstraßen", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9900", "Sonstige Gewässer", boundingBoxGermany))
            add(CodelistHandler.toCodelistEntry("9999", "Sonstiger Ortsbezug", boundingBoxGermany))
        }
    }

    private fun createCodelistIdentifierType(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "identifierType"
        catalog = catalogRef
        name = "Identifier Type"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("1", "Handle"))
            add(CodelistHandler.toCodelistEntry("2", "ISBN"))
            add(CodelistHandler.toCodelistEntry("3", "ISSN"))
        }
    }

    private fun createCodelistVerticalSpatialSystems(catalogRef: Catalog): Codelist = Codelist().apply {
        identifier = "verticalSpatialSystems"
        catalog = catalogRef
        name = "Vertical Coordinate Reference System"
        description = ""
        data = jacksonObjectMapper().createArrayNode().apply {
            add(CodelistHandler.toCodelistEntry("5783", "EPSG:5783 DHHN92 Höhe"))
            add(CodelistHandler.toCodelistEntry("7699", "EPSG:7699 DHHN12 Höhe"))
            add(CodelistHandler.toCodelistEntry("7837", "EPSG:7837 DHHN2016 Höhe"))
        }
    }
}
