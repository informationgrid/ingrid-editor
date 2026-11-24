package de.ingrid.igeserver.profiles.sample

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.profiles.ingrid.InGridProfile
import de.ingrid.igeserver.profiles.ingrid.quickfilter.OpenDataCategory
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.IndexIdFieldConfig
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class SampleProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @Lazy documentService: DocumentService,
    query: QueryRepository,
    dateService: DateService,
    openDataCategory: OpenDataCategory,
) : InGridProfile(catalogRepo, codelistHandler, documentService, query, dateService, openDataCategory) {
    override val identifier = "sample"
    override val title = "Sample catalog"
    override val indexExportFormatID = "portal"
    override val indexIdField = IndexIdFieldConfig("uuid", "uuid")
    override val linkedProfiles = listOf("ingrid")
}
