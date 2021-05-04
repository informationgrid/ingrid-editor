package de.ingrid.igeserver.profiles.mcloud.extensions

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.utils.ElasticDocument
import org.apache.logging.log4j.kotlin.logger
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForList
import org.springframework.stereotype.Component

@Component
@Profile("mcloud & elasticsearch")
class MCloudPublishExport : Filter<PostPublishPayload> {

    val log = logger()

    @Autowired
    lateinit var docWrapperRepo: DocumentWrapperRepository

    @Autowired
    lateinit var indexService: IndexService

    @Autowired
    lateinit var documentService: DocumentService

    @Autowired
    lateinit var indexManager: IndexManager

    @Autowired
    lateinit var jdbcTemplate: JdbcTemplate

    @Value("\${elastic.alias}")
    private lateinit var elasticsearchAlias: String

    @Value("\${app.uuid}")
    private lateinit var uuid: String

    override val profiles: Array<String>?
        get() = arrayOf("mcloud")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {

        val docId = payload.document.uuid
        val docType = payload.document.type

        try {
            when (docType) {
                "mCloudDoc" -> indexMCloudDoc(context, docId)
                "AddressDoc" -> indexReferencesMCloudDocs(context, docId)
                else -> return payload
            }
        } catch (ex: NoNodeAvailableException) {
            throw ClientException.withReason("No connection to Elasticsearch: ${ex.message}")
        }

        return payload

    }

    private fun indexReferencesMCloudDocs(context: Context, docId: String) {
        context.addMessage(Message(this, "Index documents with referenced address ${docId} to Elasticsearch"))

        // get uuids from documents that reference the address
        val docsWithReferences = jdbcTemplate.queryForList<String>(
            "SELECT DISTINCT uuid FROM document WHERE (data->'addresses' @> '[{\"ref\": \"$docId\"}]')"
        )
        
        docsWithReferences.forEach { indexMCloudDoc(context, it) }

    }

    private fun indexMCloudDoc(context: Context, docId: String) {

        context.addMessage(Message(this, "Index document ${docId} to Elasticsearch"))
        // TODO: Refactor
        var oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, uuid)
        if (oldIndex == null) {
            oldIndex = IndexManager.getNextIndexName(elasticsearchAlias, uuid, "ige-ng-test")
            indexManager.createIndex(oldIndex, "base", indexManager.defaultMapping, indexManager.defaultSettings)
            indexManager.addToAlias(elasticsearchAlias, oldIndex)
        }
        val indexInfo = IndexInfo()
        indexInfo.realIndexName = oldIndex
        indexInfo.toType = "base"
        indexInfo.toAlias = elasticsearchAlias
        indexInfo.docIdField = "uuid"

        val export =
            indexService.export(context.catalogId, indexService.INDEX_SINGLE_PUBLISHED_DOCUMENT("portal", docId))

        if (export.isNotEmpty()) {
            log.debug("Exported document: " + export[0])
            indexManager.update(indexInfo, convertToElasticDocument(export[0]), false)
        } else {
            log.warn("Problem exporting document: $docId")
        }

    }


    // TODO: Refactor to utility function
    private fun convertToElasticDocument(doc: Any): ElasticDocument? {

        return jacksonObjectMapper()
            .enable(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS)
            .readValue(doc as String, ElasticDocument::class.java)

    }
}
