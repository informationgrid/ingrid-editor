package de.ingrid.igeserver.profiles.sample

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.IndexIdFieldConfig
import org.springframework.stereotype.Service

@Service
class SampleProfile : CatalogProfile {
    override val identifier = "sample"
    override val title = "Sample catalog"
    override val description: String? = null
    override val indexExportFormatID = "portal"
    override val indexIdField = IndexIdFieldConfig("uuid", "uuid")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = emptyArray()
    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> = emptyArray()

//    override fun getElasticsearchMapping(format: String): String =
//        {}.javaClass.getResource("/sample/default-mapping.json")?.readText() ?: ""

//    override fun getElasticsearchSetting(format: String): String =
//        {}.javaClass.getResource("/sample/default-settings.json")?.readText() ?: ""
}
