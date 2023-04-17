package de.ingrid.igeserver.profiles.ingrid.extensions

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import org.apache.logging.log4j.LogManager
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForList
import org.springframework.stereotype.Component

@Component
@Profile("ingrid & elasticsearch")
class InGridPublishExport @Autowired constructor(
    val docWrapperRepo: DocumentWrapperRepository,
    val jdbcTemplate: JdbcTemplate,
    val indexingTask: IndexingTask
) : Filter<PostPublishPayload> {

    companion object {
        private val log = LogManager.getLogger()
    }

    override val profiles = arrayOf("ingrid")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {

        val docId = payload.document.uuid
        val isDocument = payload.wrapper.category == "data"
        val isAddress = payload.wrapper.category == "address"

        try {
            if (isDocument) indexDoc(context, docId, DocumentCategory.DATA)
            else if (isAddress) {
                indexDoc(context, docId, DocumentCategory.ADDRESS)
                indexReferencedDocs(context, docId)
            }
        } catch (ex: NoNodeAvailableException) {
            throw ClientException.withReason("No connection to Elasticsearch: ${ex.message}")
        }

        return payload

    }

    private fun indexReferencedDocs(context: Context, docId: String) {
        context.addMessage(Message(this, "Index documents with referenced address $docId to Elasticsearch"))

        // get uuids from documents that reference the address
        val docsWithReferences = jdbcTemplate.queryForList<String>(
            """
            SELECT DISTINCT d.uuid 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.uuid = d.uuid
                AND d.state = 'PUBLISHED'
                AND dw.deleted = 0
                AND data->'pointOfContact' @> '[{"ref": "$docId"}]');
            """.trimIndent()
        )

        docsWithReferences.forEach { indexDoc(context, it, DocumentCategory.DATA) }

    }

    private fun indexDoc(context: Context, docId: String, category: DocumentCategory) {

        context.addMessage(Message(this, "Index document $docId to Elasticsearch"))
        indexingTask.updateDocument(context.catalogId, category, "indexInGridIDF", docId)

    }
}
