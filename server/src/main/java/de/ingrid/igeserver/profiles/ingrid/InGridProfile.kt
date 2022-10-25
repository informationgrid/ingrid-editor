package de.ingrid.igeserver.profiles.ingrid

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.profiles.CatalogProfile
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class InGridProfile : CatalogProfile {
    companion object {
        const val id = "ingrid"
    }

    override val identifier = id
    override val title = "InGrid Katalog"
    override val description = null
    override val indexExportFormatID = "indexInGridIDF"

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf()
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf()
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {

    }

    override fun initCatalogQueries(catalogId: String) {

    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""
    }
}