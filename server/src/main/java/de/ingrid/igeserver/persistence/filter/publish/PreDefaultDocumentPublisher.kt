/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ValidationException
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
class PreDefaultDocumentPublisher(@Lazy val documentService: DocumentService) : Filter<PrePublishPayload> {

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
        val publicationDocTags = payload.wrapper.tags.filter { it == "intranet" || it == "amtsintern" }
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
            refData.wrapper.tags.filter { it == "intranet" || it == "amtsintern" }

        val docIsAmtsintern = publicationDocTags.contains("amtsintern")
        val intranetAndRefsNotAmtsintern =
            publicationDocTags.contains("intranet") && !refPublicationDocTags.contains("amtsintern")
        val allAreInternet = publicationDocTags.isEmpty() && refPublicationDocTags.isEmpty()

        if (!(docIsAmtsintern || intranetAndRefsNotAmtsintern || allAreInternet)) {
            val tags = refPublicationDocTags.joinToString(",").run { ifEmpty { "internet" } }
            throw ValidationException.withReason(
                "Reference has wrong publication type condition: ${
                    publicationDocTags.joinToString(
                        ","
                    ).ifEmpty { "internet" } 
                } => $tags"
            )
        }
    }

    private fun checkPublishState(refData: DocumentData) {
        if (refData.document.state != DOCUMENT_STATE.PUBLISHED) {
            throw ServerException.withReason("Latest referenced dataset not published: ${refData.document.uuid}")
        }
    }
}
