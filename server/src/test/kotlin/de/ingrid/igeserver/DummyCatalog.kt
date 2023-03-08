package de.ingrid.igeserver

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.profiles.IndexIdFieldConfig
import org.springframework.stereotype.Service

@Service
class DummyCatalog : CatalogProfile {
    override val identifier = "DUMMY"
    override val title = "DUMMY Catalog"
    override val description = "This catalog is only used for test purpose"
    override val indexExportFormatID = null
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
    }

    override fun initCatalogQueries(catalogId: String) {
        TODO("Not yet implemented")
    }

    override fun getElasticsearchMapping(format: String): String {
        TODO("Not yet implemented")
    }

    override fun getElasticsearchSetting(format: String): String {
        TODO("Not yet implemented")
    }
}