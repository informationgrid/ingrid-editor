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
package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.profiles.uvp.quickfilter.EIANumber
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcedureTypes
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcessStep
import de.ingrid.igeserver.profiles.uvp.quickfilter.TitleSearch
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.Spatial
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
class UvpProfile(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val authUtils: AuthUtils,
    @JsonIgnore val behaviourService: BehaviourService
) : CatalogProfile {

    companion object {
        const val id = "uvp"
    }

    override val identifier = id
    override val title = "UVP Katalog"
    override val description = null
    override val indexExportFormatID = "indexUvpIDF"
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders(),
                    TitleSearch()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            ),
            FacetGroup(
                "spatial", "Raumbezug", arrayOf(
                    Spatial()
                ),
                viewComponent = ViewComponent.SPATIAL
            ),
            FacetGroup(
                "timeRef", "Zeitbezug", arrayOf(
                    TimeSpan()
                ),
                viewComponent = ViewComponent.TIMESPAN
            ),
            FacetGroup(
                "docType", "Verfahrenstyp", arrayOf(
                    ProcedureTypes()
                ),
                viewComponent = ViewComponent.SELECT
            ),
            FacetGroup(
                "eiaNumber", "UVP Nummer", arrayOf(
                    EIANumber()
                ),
                viewComponent = ViewComponent.SELECT
            ),
            FacetGroup(
                "processStep", "Verfahrensschritt", arrayOf(
                    ProcessStep()
                ),
                viewComponent = ViewComponent.SELECT
            )
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {

    }

    override fun initCatalogQueries(catalogId: String) {
        val behaviours = listOf("plugin.tags", "plugin.assigned.user").map { Behaviour().apply {
            name = it
            active = false
        }}
        behaviourService.save(catalogId, behaviours)
    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/uvp/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/uvp/default-settings.json")?.readText() ?: ""
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        val isAdmin = authUtils.isAdmin(principal)
        val isMdAdmin = authUtils.containsRole(principal, "md-admin")

        return if (isAdmin)
        // catalog and super admins can create uvp report
            permissions + "can_create_uvp_report"
        else if (isMdAdmin)
            permissions
        else {
            // authors can not import or export
            permissions.filterNot {
                listOf(Permissions.can_import.name, Permissions.can_export.name).contains(it)
            }
        }

    }
}
