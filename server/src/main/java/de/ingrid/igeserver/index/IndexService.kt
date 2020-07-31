package de.ingrid.igeserver.index

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import de.ingrid.igeserver.services.FIELD_DRAFT
import de.ingrid.igeserver.services.FIELD_PUBLISHED
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class IndexService @Autowired constructor(private val dbService: DBApi, private val exportService: ExportService, private val documentService: DocumentService) {

    private val log = logger()

    fun start(options: IndexOptions) {

        val queryOptions = FindOptions(queryOperator = options.queryOperator, resolveReferences = true)
        val docsToIndex = dbService.findAll(DocumentWrapperType::class, options.dbFilter, queryOptions)
        if (docsToIndex.totalHits == 0L) {
            log.warn("No documents found for indexing")
            return
        }

        val exporter = exportService.getExporter(options.exportFormat)

        val onlyPublished = options.documentState == FIELD_PUBLISHED
        docsToIndex.hits
                .map { documentService.getLatestDocument(it, onlyPublished) }
                .map { exporter.run(it) }
                .forEach { println(it) }

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