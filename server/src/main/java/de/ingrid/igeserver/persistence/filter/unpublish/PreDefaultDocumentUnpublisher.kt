package de.ingrid.igeserver.persistence.filter.unpublish

import de.ingrid.igeserver.exceptions.ChildDatasetException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreUnpublishPayload
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.documentInPublishedState
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Filter for validating if a document can be unpublished.
 */
@Component
class PreDefaultDocumentUnpublisher(@Lazy val documentService: DocumentService) : Filter<PreUnpublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreUnpublishPayload, context: Context): PreUnpublishPayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before unpublishing."))

        checkChildren(context.catalogId, payload.wrapper.id!!)

        // call entity type specific hook
        payload.type.onUnpublish(payload.document)

        return payload
    }

    private fun checkChildren(catalogId: String, wrapperId: Int) {
        val publishedChildren = documentService.findChildren(
            catalogId,
            wrapperId
        ).hits.filter { documentInPublishedState(it.document) }
        
        if (publishedChildren.isNotEmpty()) {
            throw ChildDatasetException.mustNotBePublished(publishedChildren.map { it.wrapper.uuid })
        }
    }
    
}
