package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostDeletePayload
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.context.annotation.Lazy

/**
 * Filter for processing steps after removing the document.
 */
@Component
class PostDefaultDocumentRemover @Autowired constructor(@Lazy val documentService: DocumentService) :
    Filter<PostDeletePayload> {



    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostDeletePayload, context: Context): PostDeletePayload {

        // remove from index
        this.documentService.removeFromIndex(context.catalogId, payload.wrapper.uuid)

        return payload
    }

}
