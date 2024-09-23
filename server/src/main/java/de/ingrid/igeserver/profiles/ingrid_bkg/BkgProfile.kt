package de.ingrid.igeserver.profiles.ingrid_bkg

import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class BkgProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    @Lazy private val catalogService: CatalogService,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {

    companion object {
        const val ID = "ingrid-bkg"
    }

    override val identifier = ID
    override val title = "InGrid Katalog (BKG)"
    override val parentProfile = "ingrid"
    override val indexExportFormatID = "indexInGridIDFBkg"

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        super.initCatalogCodelists(catalogId, codelistId)

        val catalog = catalogService.getCatalogById(catalogId)
        catalog.settings.config.codelistFavorites = mutableMapOf("10003" to listOf("99"))
        catalogService.updateCatalog(catalog)
    }
}
