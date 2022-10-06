package de.ingrid.igeserver.index

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.DataModel
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import de.ingrid.igeserver.services.ResearchService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.context.annotation.Lazy

const val PAGE_SIZE: Int = 100

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val exportService: ExportService,
    @Lazy private val documentService: DocumentService,
    private val researchService: ResearchService
) {

    private val log = logger()

    fun getSinglePublishedDocument(
        catalogId: String,
        category: DocumentCategory,
        format: String,
        uuid: String
    ): Document {
        return documentService.getLastPublishedDocument(catalogId, uuid)
    }

    fun getPublishedDocuments(
        catalogId: String,
        category: String,
        format: String,
        currentPage: Int = 0
    ): Page<Document> {
        val auth = SecurityContextHolder.getContext().authentication

        val conditions = mutableListOf("category = '$category'", "state = 'PUBLISHED'", "deleted = 0")

        // TODO: support profile specific configuration which documents to be published
        // TODO: extract profile specific configuration to profile files
        val publishNegativeAssessments =
            DataModel.behaviourService?.get(catalogId, "plugin.publish.negative.assessment")?.active ?: false
        val publishNegativeAssessmentsOnlyWithSpatialReferences =
            DataModel.behaviourService?.get(catalogId, "plugin.publish.negative.assessment")?.data?.get("onlyWithSpatial") == true

        if (!publishNegativeAssessments) conditions.add("document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc'")
        if ( publishNegativeAssessmentsOnlyWithSpatialReferences ) conditions.add("(document_wrapper.type != 'UvpNegativePreliminaryAssessmentDoc' OR (jsonb_path_exists(jsonb_strip_nulls(data), '\$.spatial')))")

        val filter =
            BoolFilter("AND", conditions, null, null, false)

        val response = researchService.query(
            auth,
            emptySet(),
            catalogId,
            ResearchQuery(null, filter, pagination = ResearchPaging(currentPage + 1, PAGE_SIZE))
        )
        val docsToIndex = response.hits
            .map { documentService.getLastPublishedDocument(catalogId, it._uuid!!).apply { wrapperId = it._id } }

        val pagedDocs = PageImpl(docsToIndex, Pageable.ofSize(PAGE_SIZE), response.totalHits.toLong())

        return if (pagedDocs.isEmpty) {
            log.warn("No documents found in category '$category' for indexing")
            Page.empty()
        } else {
            pagedDocs
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

    fun getConfig(catalogId: String): CatalogSettings? = catalogRepo.findByIdentifier(catalogId).settings

    fun getLastLog(catalogId: String): IndexMessage? {

        return catalogRepo.findByIdentifier(catalogId)
            .settings?.lastLogSummary
    }

/*
    private fun getVersion(wrapper: JsonNode, options: IndexOptions): JsonNode {

        return if (options.documentState == FIELD_PUBLISHED || wrapper.get(FIELD_DRAFT) == null) {
            wrapper.get(FIELD_PUBLISHED)
        } else {
            wrapper.get(FIELD_DRAFT)
        }

    }*/

}
