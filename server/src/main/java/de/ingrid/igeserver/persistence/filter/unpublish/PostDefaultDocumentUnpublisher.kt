package de.ingrid.igeserver.persistence.filter.unpublish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostUnpublishPayload
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Filter for processing steps after unpublishing.
 */
@Component
@Profile("elasticsearch")
class PostDefaultDocumentUnpublisher(val indexTask: IndexingTask) :
    Filter<PostUnpublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostUnpublishPayload, context: Context): PostUnpublishPayload {

        // remove from index
        this.indexTask.removeFromIndex(context.catalogId, payload.wrapper.uuid, payload.wrapper.category!!)

        return payload
    }

}
