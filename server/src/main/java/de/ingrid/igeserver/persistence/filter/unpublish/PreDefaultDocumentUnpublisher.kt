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
            wrapperId,
        ).hits.filter { documentInPublishedState(it.document) }

        if (publishedChildren.isNotEmpty()) {
            throw ChildDatasetException.mustNotBePublished(publishedChildren.map { it.wrapper.uuid })
        }
    }
}
