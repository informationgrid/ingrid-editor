package de.ingrid.igeserver.index

import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val dbService: DBApi,
    private val exportService: ExportService,
    private val documentService: DocumentService
) {

    private val log = logger()

    val INDEX_PUBLISHED_DOCUMENTS = { format: String ->
        val onlyPublishedDocs = listOf(
            QueryField(FIELD_PUBLISHED, null, true),
            QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value)
        )

        IndexOptions(onlyPublishedDocs, format)
    }
    val INDEX_SINGLE_PUBLISHED_DOCUMENT = { format: String, uuid: String ->
        val singlePublishedDoc = listOf(
            QueryField(FIELD_PUBLISHED, null, true),
            QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
            QueryField(FIELD_ID, uuid)
        )

        IndexOptions(singlePublishedDoc, format)
    }

    fun start(options: IndexOptions): List<Any> {

        val queryOptions = FindOptions(queryOperator = options.queryOperator, resolveReferences = true)
        val docsToIndex = dbService.findAll(DocumentWrapperType::class, options.dbFilter, queryOptions)
        if (docsToIndex.totalHits == 0L) {
            log.warn("No documents found for indexing")
            return emptyList()
        }

        val exporter = exportService.getExporter(options.exportFormat)

        val onlyPublished = options.documentState == FIELD_PUBLISHED
        return docsToIndex.hits
            .map { documentService.getLatestDocument(it, onlyPublished) }
            .map { exporter.run(it) }

    }

    fun updateConfig(catalogId: String, cronPattern: String) {

        val catalog = catalogRepo.findByIdentifier(catalogId)
        catalog.settings = CatalogSettings(cronPattern)
        catalogRepo.save(catalog)

    }

    fun getConfig(catalogId: String): String? = catalogRepo.findByIdentifier(catalogId).settings?.indexCronPattern

/*
    private fun getVersion(wrapper: JsonNode, options: IndexOptions): JsonNode {

        return if (options.documentState == FIELD_PUBLISHED || wrapper.get(FIELD_DRAFT) == null) {
            wrapper.get(FIELD_PUBLISHED)
        } else {
            wrapper.get(FIELD_DRAFT)
        }

    }*/

}