package de.ingrid.igeserver.persistence.filter.unpublish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostUnpublishPayload
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.context.annotation.Lazy

/**
 * Filter for processing steps after unpublishing.
 */
@Component
class PostDefaultDocumentUnpublisher @Autowired constructor(@Lazy val documentService: DocumentService) :
    Filter<PostUnpublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostUnpublishPayload, context: Context): PostUnpublishPayload {

        // remove from index
        this.documentService.removeFromIndex(payload.wrapper.uuid)

        return payload
    }

}
