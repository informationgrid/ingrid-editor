package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostDeletePayload
import de.ingrid.igeserver.tasks.IndexingTask
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Filter for processing steps after removing the document.
 */
@Component
@Profile("elasticsearch")
class PostDefaultDocumentRemover @Autowired constructor(val indexTask: IndexingTask) : Filter<PostDeletePayload> {

    private val log = logger()

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostDeletePayload, context: Context): PostDeletePayload {

        // remove from index
        try {
            this.indexTask.removeFromIndex(context.catalogId, payload.wrapper.uuid, payload.wrapper.category!!)
        } catch (e: NoElasticsearchConnectionException) {
            // just give a warning so that delete operation succeeds since it runs in a transaction
            log.warn("There's no connection to Elasticsearch: ${e.message}")
        }

        return payload
    }

}
