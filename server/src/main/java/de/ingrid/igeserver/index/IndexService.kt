package de.ingrid.igeserver.index

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import de.ingrid.igeserver.services.ResearchService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

const val PAGE_SIZE: Int = 100

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val researchService: ResearchService,
) {

    private val log = logger()

    fun getSinglePublishedDocument(
        catalogId: String,
        category: String,
        catalogProfile: CatalogProfile,
        uuid: String
    ): Document {
        val filter = createConditionsForDocumentsToPublish(catalogId, category, catalogProfile, uuid)
        val (_, docsToIndex) = searchAndGetDocuments(catalogId, filter)
        return docsToIndex.single()
    }

    fun getPublishedDocuments(
        catalogId: String,
        category: String,
        catalogProfile: CatalogProfile,
        currentPage: Int = 0
    ): Page<Document> {
        val filter = createConditionsForDocumentsToPublish(catalogId, category, catalogProfile)
        val (totalHits, docsToIndex) = searchAndGetDocuments(catalogId, filter, currentPage)

        val pagedDocs = PageImpl(docsToIndex, Pageable.ofSize(PAGE_SIZE), totalHits)

        return if (pagedDocs.isEmpty) {
            log.warn("No documents found in category '$category' for indexing")
            Page.empty()
        } else {
            pagedDocs
        }
    }

    private fun searchAndGetDocuments(
        catalogId: String,
        filter: BoolFilter,
        currentPage: Int = 0
    ): Pair<Long, List<Document>> {
        val auth = SecurityContextHolder.getContext().authentication

        val response = researchService.query(
            auth,
            emptySet(),
            catalogId,
            ResearchQuery(null, filter, pagination = ResearchPaging(currentPage + 1, PAGE_SIZE))
        )
        val docsToIndex = response.hits
//            .map { docWrapperRepo.findById(it._id.toInt()).get() }
//            .map { documentService.getLatestDocument(it, true, catalogId = catalogId) }
            .map { documentService.getLastPublishedDocument(catalogId, it._uuid!!).apply { wrapperId = it._id } }
        return Pair(response.totalHits.toLong(), docsToIndex)
    }

    private fun createConditionsForDocumentsToPublish(
        catalogId: String,
        category: String,
        profile: CatalogProfile,
        uuid: String? = null
    ): BoolFilter {
        val conditions = mutableListOf("category = '$category'", "published IS NOT NULL", "deleted = 0")

        uuid?.let { conditions.add("document_wrapper.uuid = '$it'") }

        // add profile specific conditions
        conditions.addAll(profile.additionalPublishConditions(catalogId))

        return BoolFilter("AND", conditions, null, null, false)
    }

    fun getExporter(category: DocumentCategory, exportFormat: String): IgeExporter =
        exportService.getExporter(category, exportFormat)

    fun updateConfig(config: IndexConfigOptions) {

        val catalog = catalogRepo.findByIdentifier(config.catalogId)
        if (catalog.settings == null) {
            catalog.settings = CatalogSettings(config.cronPattern)
        } else {
            catalog.settings!!.indexCronPattern = config.cronPattern
        }
        catalog.settings!!.exportFormat = config.exportFormat
        catalogRepo.save(catalog)

    }

    fun getLastLog(catalogId: String): IndexMessage? {

        return catalogRepo.findByIdentifier(catalogId)
            .settings?.lastLogSummary
    }

}
