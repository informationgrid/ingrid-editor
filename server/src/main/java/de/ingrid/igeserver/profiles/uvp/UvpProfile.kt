package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.research.quickfilter.Spatial
import de.ingrid.igeserver.profiles.uvp.quickfilter.EIANumber
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcedureTypes
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcessStep
import de.ingrid.igeserver.profiles.uvp.quickfilter.TitleSearch
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.Permissions
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
@Profile("uvp")
class UvpProfile @Autowired constructor(
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val authUtils: AuthUtils
) : CatalogProfile {

    companion object {
        const val id = "uvp"
    }

    override val identifier = id
    override val title = "UVP Katalog"
    override val description = null
    override val indexExportFormatID = "indexUvpIDF"

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

    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/uvp/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/uvp/default-settings.json")?.readText() ?: ""
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        val isAdmin = authUtils.isAdmin(principal)
        val isMdAdmin = principal.authorities.any { it.authority == "md-admin" }

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
