package de.ingrid.igeserver.profiles

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import org.springframework.security.core.Authentication

interface CatalogProfile {
    @get:JsonProperty("id")
    val identifier: String
    val title: String
    val description: String?
    val indexExportFormatID: String?
    val parentProfile: String?
        get() = null

    @get:JsonIgnore
    val indexIdField: IndexIdFieldConfig

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
    fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        return permissions
    }

    @JsonIgnore
    fun additionalPublishConditions(catalogId: String): List<String> = emptyList()

    @JsonIgnore
    fun additionalImportAnalysis(catalogId: String, report: OptimizedImportAnalysis, message: Message) {}

}

data class IndexIdFieldConfig(
    val document: String,
    val address: String
)
