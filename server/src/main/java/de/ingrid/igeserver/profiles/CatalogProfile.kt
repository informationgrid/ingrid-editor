package de.ingrid.igeserver.profiles

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.model.FacetGroup
import org.springframework.security.core.Authentication

interface CatalogProfile {
    @get:JsonProperty("id")
    val identifier: String
    val title: String
    val description: String?
    val indexExportFormatID: String?

    @JsonIgnore
    fun getFacetDefinitionsForDocuments(): Array<FacetGroup>

    @JsonIgnore
    fun getFacetDefinitionsForAddresses(): Array<FacetGroup>

    @JsonIgnore
    fun initCatalogCodelists(catalogId: String, codelistId: String? = null)

    @JsonIgnore
    fun initCatalogQueries(catalogId: String)

    @JsonIgnore
    fun getElasticsearchMapping(format: String): String

    @JsonIgnore
    fun getElasticsearchSetting(format: String): String

    @JsonIgnore
    fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String>{
        return permissions
    }
}
