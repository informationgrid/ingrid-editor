package de.ingrid.igeserver.profiles.ingrid_up_sh

import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImport
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.profiles.ingrid_up_sh.importer.ISOImportUPSH
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class UPSHProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
    isoImport: ISOImport,
    isoImportUPSH: ISOImportUPSH,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {
    override val identifier = "ingrid-up-sh"
    override val title = "InGrid Katalog (UP-SH)"
    override val parentProfile = "ingrid"
    
    init {
        isoImport.profileMapper = isoImportUPSH
    }
}