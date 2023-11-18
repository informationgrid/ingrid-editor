package de.ingrid.igeserver.profiles.krzn

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("krzn")
class KrznProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val id = "ingrid-krzn"
    }

    override val identifier = id
    override val title = "InGrid Katalog (KRZN)"
    override val parentProfile: String? = "ingrid"

    override val indexExportFormatID = "indexInGridIDFKrzn"

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist10500 = createCodelist10500(catalogRef)
        when (codelistId) {
            "10500" -> {
                codelistHandler.removeAndAddCodelist(catalogId, codelist10500)
                return
            }
            null -> codelistHandler.removeAndAddCodelist(catalogId, codelist10500)
        }
        
        super.initCatalogCodelists(catalogId, codelistId)

    }

    private fun createCodelist10500(catalogRef: Catalog): Codelist {
        return Codelist().apply {
            identifier = "10500"
            catalog = catalogRef
            name = "Alternative Karten-Clients"
            description = ""
            defaultEntry = "1"
            data = jacksonObjectMapper().createArrayNode().apply {
                add(CodelistHandler.toCodelistEntry("1", "https://geoportal-niederrhein.de/krefeld/bauenundplanen/?mdid={ID}"))
                add(CodelistHandler.toCodelistEntry("2", "https://geoportal-niederrhein.de/krefeld/natur/?mdid={ID}"))
            }
        }
    }
}