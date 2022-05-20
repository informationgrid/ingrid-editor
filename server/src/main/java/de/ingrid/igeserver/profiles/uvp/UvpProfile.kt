package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.profiles.uvp.quickfilter.ProcedureTypes
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service()
@Profile("uvp")
class UvpProfile @Autowired constructor(
    @JsonIgnore val codelistRepo: CodelistRepository,
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val query: QueryRepository,
    @JsonIgnore val dateService: DateService,
    @JsonIgnore val authUtils: AuthUtils
) : CatalogProfile {

    override val identifier = "uvp"
    override val title = "UVP Katalog"
    override val description = null
    override val indexExportFormatID = "indexUvpIDF"

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
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
                "procedureType", "Verfahrenstyp", arrayOf(
                    ProcedureTypes()
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

        return if (isAdmin) permissions + "can_create_uvp_report" else permissions
    }
}
