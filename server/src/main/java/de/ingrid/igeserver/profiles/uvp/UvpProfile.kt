package de.ingrid.igeserver.profiles.uvp

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.mcloud.research.quickfilter.Spatial
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.research.quickfilter.DocMCloud
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.research.quickfilter.Published
import de.ingrid.igeserver.research.quickfilter.TimeSpan
import de.ingrid.igeserver.research.quickfilter.address.Organisations
import de.ingrid.igeserver.research.quickfilter.address.Persons
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.Permissions
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
    @JsonIgnore val dateService: DateService
) : CatalogProfile {

    override val identifier = "uvp"
    override val title = "UVP Katalog"
    override val description = null
    override val indexExportFormatID = null

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Allgemein", arrayOf(
                    Published(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
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

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String>{
        return permissions
    }
}
