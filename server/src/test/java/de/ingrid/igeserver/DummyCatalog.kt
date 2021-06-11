package de.ingrid.igeserver

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.profiles.CatalogProfile
import org.springframework.stereotype.Service

@Service
class DummyCatalog : CatalogProfile {
    override val identifier: String
        get() = "DUMMY"
    override val title: String
        get() = "DUMMY Catalog"
    override val description: String?
        get() = "This catalog is only used for test purpose"

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
    }

    override fun getElasticsearchMapping(format: String): String {
        TODO("Not yet implemented")
    }

    override fun getElasticsearchSetting(format: String): String {
        TODO("Not yet implemented")
    }
}