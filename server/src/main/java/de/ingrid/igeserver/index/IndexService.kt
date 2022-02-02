package de.ingrid.igeserver.index

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val exportService: ExportService,
    private val documentService: DocumentService,
    private val researchService: ResearchService
) {

    private val log = logger()

    val INDEX_PUBLISHED_DOCUMENTS = { format: String ->
        val onlyPublishedDocs = listOf(
            QueryField(FIELD_PUBLISHED, null, true)
        )

        IndexOptions(onlyPublishedDocs, format)
    }
    val INDEX_SINGLE_PUBLISHED_DOCUMENT = { format: String, uuid: String ->
        val singlePublishedDoc = listOf(
            QueryField(FIELD_PUBLISHED, null, true),
            QueryField("uuid", uuid)
        )

        IndexOptions(singlePublishedDoc, format)
    }

    fun getSinglePublishedDocument(
        catalogId: String,
        category: DocumentCategory,
        format: String,
        uuid: String
    ): Document {
        val doc = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
        assert(doc.published != null)
        return documentService.getLatestDocument(doc, true, catalogId = catalogId)
    }

    fun getPublishedDocuments(
        catalogId: String,
        category: String,
        format: String,
        currentPage: Int = 0
    ): Page<Document> {
        val auth = SecurityContextHolder.getContext().authentication
        val filter = BoolFilter("AND", listOf("category = 'data'", "published IS NOT NULL", "deleted = 0"), null, null, false)
        val response = researchService.query(
            auth,
            emptySet(),
            catalogId,
            ResearchQuery(null, filter, pagination = ResearchPaging(currentPage + 1, 10))
        )
        val docsToIndex = response.hits
            .map { docWrapperRepo.findById(it._id).get() }
            .map { documentService.getLatestDocument(it, true, catalogId = catalogId) }

        val pagedDocs = PageImpl(docsToIndex)

        return if (pagedDocs.isEmpty) {
            log.warn("No documents found for indexing")
            Page.empty()
        } else {
            pagedDocs
        }
    }

    fun getExporter(category: DocumentCategory, exportFormat: String): IgeExporter =
        exportService.getExporter(category, exportFormat)

    fun updateConfig(catalogId: String, cronPattern: String) {

        val catalog = catalogRepo.findByIdentifier(catalogId)
        if (catalog.settings == null) {
            catalog.settings = CatalogSettings(cronPattern)
        } else {
            catalog.settings!!.indexCronPattern = cronPattern
        }
        catalogRepo.save(catalog)

    }

    fun getConfig(catalogId: String): String? = catalogRepo.findByIdentifier(catalogId).settings?.indexCronPattern

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