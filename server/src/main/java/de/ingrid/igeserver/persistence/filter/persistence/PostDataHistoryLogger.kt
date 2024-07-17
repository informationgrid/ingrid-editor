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
package de.ingrid.igeserver.persistence.filter.persistence

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPersistencePayload
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_DOCUMENT_TYPE
import de.ingrid.igeserver.services.FIELD_UUID
import de.ingrid.igeserver.utils.getRawJsonFromDocument
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Filter for logging document data send from the client after successfully persisting in the storage
 * NOTE This class uses AuditLogger to create and log messages
 */
@Component
class PostDataHistoryLogger(
    var auditLogger: AuditLogger,
    @Lazy var documentService: DocumentService
) : Filter<PostPersistencePayload> {

    companion object {
        const val LOGGER_NAME = "audit.data-history"
        const val LOG_CATEGORY = "data-history"
    }

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostPersistencePayload, context: Context): PostPersistencePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Log document data '$docId' after persistence"))
        auditLogger.log(
            category = LOG_CATEGORY,
            action = payload.action.name.lowercase(),
            target = docId,
            data = getRawJsonFromDocument(payload.document).apply {
                put(FIELD_UUID, payload.document.uuid)
                put(FIELD_DOCUMENT_TYPE, payload.document.type)
            },
            logger = LOGGER_NAME,
            catalogIdentifier = payload.catalogIdentifier,
            principal = context.principal
        )
        return payload
    }
}
