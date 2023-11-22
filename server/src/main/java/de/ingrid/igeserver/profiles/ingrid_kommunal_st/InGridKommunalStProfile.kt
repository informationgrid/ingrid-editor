package de.ingrid.igeserver.profiles.ingrid_kommunal_st

import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class InGridKommunalStProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {
    companion object {
        const val id = "ingrid-kommunal-st"
    }

    override val identifier = id
    override val title = "InGrid Katalog (Kommunal ST)"
    override val parentProfile: String? = "ingrid"
}