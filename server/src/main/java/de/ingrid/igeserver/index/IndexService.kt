package de.ingrid.igeserver.index

import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogSettings
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class IndexService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val exportService: ExportService,
    private val documentService: DocumentService
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

    fun start(catalogId: String, options: IndexOptions): List<Any> {

        // TODO: Request all results or use paging
        val docsToIndex = documentService.find(catalogId, "data", options.dbFilter)
        if (docsToIndex.isEmpty()) {
            log.warn("No documents found for indexing")
            return emptyList()
        }

        val exporter = exportService.getExporter(options.exportFormat)

        val onlyPublished = options.documentState == FIELD_PUBLISHED
        return docsToIndex.content
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