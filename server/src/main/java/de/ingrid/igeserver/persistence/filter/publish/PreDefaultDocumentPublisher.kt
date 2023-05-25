package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DocumentData
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before publish
 */
@Component
class PreDefaultDocumentPublisher(@Lazy val documentService: DocumentService): Filter<PrePublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PrePublishPayload, context: Context): PrePublishPayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before publish"))

        checkAllPublishedWithPublicationType(context.catalogId, payload)

        // call entity type specific hook
        payload.type.onPublish(payload.document)

        return payload
    }

    private fun checkAllPublishedWithPublicationType(catalogId: String, payload: PrePublishPayload) {
        val publicationDocTags = payload.wrapper.tags?.filter { it == "intranet" || it == "amtsintern" } ?: emptyList()
        documentService.getReferencedWrapperIds(catalogId, payload.document)
            .map { ref -> documentService.getDocumentFromCatalog(catalogId, ref) }
            .forEach { refData: DocumentData ->
                checkPublishState(refData)
                checkPublicationCondition(refData, publicationDocTags)
            }
    }

    private fun checkPublicationCondition(
        refData: DocumentData,
        publicationDocTags: List<String>
    ) {
        val refPublicationDocTags =
            refData.wrapper.tags?.filter { it == "intranet" || it == "amtsintern" } ?: emptyList()
        val bothInternetWide = publicationDocTags.isEmpty() && refPublicationDocTags.isEmpty()
        val bothAtLeastOne = publicationDocTags.intersect(refPublicationDocTags.toSet()).isNotEmpty()
        
        if (!(bothInternetWide || bothAtLeastOne)) {
            throw ServerException.withReason(
                "Reference has wrong publication type condition: ${
                    publicationDocTags.joinToString(
                        ","
                    )
                } => ${refPublicationDocTags.joinToString(",")}"
            )
        }
    }

    private fun checkPublishState(refData: DocumentData) {
        if (refData.document.state !== DOCUMENT_STATE.PUBLISHED) {
            throw ServerException.withReason("Latest referenced dataset not published: ${refData.document.uuid}")
        }
    }
}
