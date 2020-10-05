package de.ingrid.igeserver.profiles.mcloud.extensions

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.services.FIELD_ID
import de.ingrid.utils.ElasticDocument
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class MCloudPublishExport : Filter<PostPublishPayload> {

    @Autowired
    lateinit var indexService: IndexService;

    @Autowired
    lateinit var indexManager: IndexManager;

    @Value("\${elastic.alias}")
    private lateinit var elasticsearchAlias: String

    @Value("\${app.uuid}")
    private lateinit var uuid: String

    override val profiles: Array<String>?
        get() = arrayOf("mcloud")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {

        val docId = payload.document[FIELD_ID].asText();
        context.addMessage(Message(this, "Index document ${docId} to Elasticsearch"))

        // TODO: Refactor
        var oldIndex = indexManager.getIndexNameFromAliasName(elasticsearchAlias, uuid)
        if (oldIndex == null) {
            oldIndex = IndexManager.getNextIndexName(elasticsearchAlias, uuid, "ige-ng-test")
            indexManager.createIndex(oldIndex, "base", indexManager.defaultMapping, indexManager.defaultSettings)
        }
        val indexInfo = IndexInfo()
        indexInfo.realIndexName = oldIndex
        indexInfo.toType = "base"
        indexInfo.toAlias = elasticsearchAlias
        indexInfo.docIdField = "uuid"

        val export = indexService.start(indexService.INDEX_SINGLE_PUBLISHED_DOCUMENT("portal", docId))
        indexManager.update(indexInfo, convertToElasticDocument(export[0]), false)

        return payload
    }


    // TODO: Refactor to utility function
    private fun convertToElasticDocument(doc: Any): ElasticDocument? {

        return jacksonObjectMapper()
                .enable(JsonParser.Feature.ALLOW_UNQUOTED_CONTROL_CHARS)
                .readValue(doc as String, ElasticDocument::class.java)

    }
}