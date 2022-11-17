package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class InGridProfile @Autowired constructor(@JsonIgnore val catalogRepo: CatalogRepository, @JsonIgnore val codelistHandler: CodelistHandler) : CatalogProfile {
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
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist6006 = Codelist().apply {
            identifier = "6006"
            catalog = catalogRef
            name = "Freie Konformitäten"
            description = ""
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "Konformität - Freier Eintrag", "2018-02-22"))
            }
        }

        when (codelistId) {
            "6006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist6006)
            null -> {
                codelistHandler.removeAndAddCodelist("6006", codelist6006)
            }

            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
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