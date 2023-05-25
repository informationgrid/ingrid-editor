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
import de.ingrid.igeserver.services.*
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
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val researchService: ResearchService,
    private val behaviourService: BehaviourService,
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
            .map { documentService.getLastPublishedDocument(catalogId, it._uuid!!).apply { wrapperId = it._id } }
        return Pair(response.totalHits.toLong(), docsToIndex)
    }

    private fun createConditionsForDocumentsToPublish(
        catalogId: String,
        category: String,
        profile: CatalogProfile,
        uuid: String? = null
    ): BoolFilter {
        val conditions = mutableListOf("category = '$category'", "document1.state = 'PUBLISHED'", "deleted = 0")

        uuid?.let { conditions.add("document_wrapper.uuid = '$it'") }

        // add system specific conditions
        conditions.addAll(getSystemSpecificConditions(catalogId))
        
        // add profile specific conditions
        conditions.addAll(profile.additionalPublishConditions(catalogId))

        return BoolFilter("AND", conditions, null, null, false)
    }

    private fun getSystemSpecificConditions(catalogId: String): Collection<String> {
        var publicationTypesActive = false
        var publicationTypes: List<String>? = null
        behaviourService.get(catalogId, "plugin.indexing-tags")?.let {
            publicationTypesActive = it.active != null && it.active == true
            publicationTypes = it.data?.get("publicationTypes") as List<String>?
        }
        
        return if (publicationTypesActive) {
            var conditions: String = publicationTypes
                ?.filter { it != "internet" }
                ?.joinToString(" OR ") { "'{$it}' && document_wrapper.tags" } ?: ""
            if (publicationTypes?.contains("internet") == true) {
                if (conditions.isNotEmpty()) conditions += " OR"
                conditions += " document_wrapper.tags is null"
            }
            listOf("($conditions)")
        } else {
            emptyList()
        }
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
