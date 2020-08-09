package de.ingrid.igeserver.index

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class IndexService @Autowired constructor(private val dbService: DBApi, private val exportService: ExportService, private val documentService: DocumentService) {

    private val log = logger()

    val INDEX_PUBLISHED_DOCUMENTS = { format: String ->
        val onlyPublishedDocs = listOf(
                QueryField(FIELD_PUBLISHED, null, true),
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value)
        )

        IndexOptions(onlyPublishedDocs, format)
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

    fun updateConfig(cronPattern: String) {

        val info = this.dbService.findAll(CatalogInfoType::class)[0] as ObjectNode
        info.put("cron", cronPattern)
        dbService.save(CatalogInfoType::class, dbService.getRecordId(info), info.toString())

    }

    fun getConfig(): String? {

        val info = this.dbService.findAll(CatalogInfoType::class)[0] as ObjectNode
        return info.get("cron")?.asText()

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