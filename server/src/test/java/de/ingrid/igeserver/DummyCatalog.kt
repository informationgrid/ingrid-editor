package de.ingrid.igeserver

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.profiles.CatalogProfile
import org.springframework.stereotype.Service

@Service
class DummyCatalog : CatalogProfile {
    override val identifier: String
        get() = TODO("Not yet implemented")
    override val title: String
        get() = TODO("Not yet implemented")
    override val description: String?
        get() = TODO("Not yet implemented")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun initCatalogCodelists(catalogId: String) {
    }
}