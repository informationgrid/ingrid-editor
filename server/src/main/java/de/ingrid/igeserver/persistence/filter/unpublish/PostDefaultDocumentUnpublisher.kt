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

import de.ingrid.igeserver.exceptions.NoElasticsearchConnectionException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostUnpublishPayload
import de.ingrid.igeserver.persistence.filter.persistence.PostDataHistoryLogger
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.IndexingTask
import de.ingrid.igeserver.utils.getRawJsonFromDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 * Filter for processing steps after unpublishing.
 */
@Component
class PostDefaultDocumentUnpublisher(
    var auditLogger: AuditLogger,
    @Lazy var documentService: DocumentService,
    val indexTask: IndexingTask,
) :
    Filter<PostUnpublishPayload> {

    private val log = logger()

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostUnpublishPayload, context: Context): PostUnpublishPayload {
        // remove from index
        try {
            this.indexTask.removeFromIndex(context.catalogId, payload.wrapper.uuid, payload.wrapper.category!!)
        } catch (e: NoElasticsearchConnectionException) {
            // just give a warning so that delete operation still succeeds for published documents which are not indexed (e.g. hideAddress in ingrid)
            log.warn("Could not remove '${payload.wrapper.uuid}' from ES index: ${e.message}")
        }

        // log in audit-log
        val docId = payload.document.uuid
        context.addMessage(Message(this, "Log document data '$docId' after unpublish"))
        auditLogger.log(
            category = PostDataHistoryLogger.LOG_CATEGORY,
            action = payload.action.name.lowercase(),
            target = docId,
            data = getRawJsonFromDocument(payload.document, true),
            logger = PostDataHistoryLogger.LOGGER_NAME,
            catalogIdentifier = payload.catalogIdentifier,
            principal = context.principal,
        )
        return payload
    }
}
