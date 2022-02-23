package de.ingrid.igeserver.profiles.mcloud.extensions

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import org.apache.logging.log4j.kotlin.logger
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForList
import org.springframework.stereotype.Component

@Component
@Profile("mcloud & elasticsearch")
class MCloudPublishExport @Autowired constructor(
    val docWrapperRepo: DocumentWrapperRepository,
    val jdbcTemplate: JdbcTemplate,
    val indexingTask: IndexingTask
) : Filter<PostPublishPayload> {

    val log = logger()

    override val profiles = arrayOf("mcloud")

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
        context.addMessage(Message(this, "Index documents with referenced address $docId to Elasticsearch"))

        // get uuids from documents that reference the address
        val docsWithReferences = jdbcTemplate.queryForList<String>(
            """
            SELECT DISTINCT d.uuid 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.published = d.id
                AND dw.deleted = 0
                AND data->'addresses' @> '[{"ref": "$docId"}]');
            """.trimIndent()
        )

        docsWithReferences.forEach { indexMCloudDoc(context, it) }

    }

    private fun indexMCloudDoc(context: Context, docId: String) {

        context.addMessage(Message(this, "Index document $docId to Elasticsearch"))
        indexingTask.updateDocument(context.catalogId, DocumentCategory.DATA, "portal", docId)

    }
}
