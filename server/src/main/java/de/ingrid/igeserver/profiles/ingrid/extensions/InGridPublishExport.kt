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
package de.ingrid.igeserver.profiles.ingrid.extensions

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForList
import org.springframework.stereotype.Component

@Component
class InGridPublishExport(
    val docWrapperRepo: DocumentWrapperRepository,
    val jdbcTemplate: JdbcTemplate,
    val indexingTask: IndexingTask,
) : Filter<PostPublishPayload> {

    val log = logger()

    override val profiles = arrayOf("ingrid")

    @OptIn(DelicateCoroutinesApi::class)
    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {
        val docId = payload.document.uuid
        val isDocument = payload.wrapper.category == "data"
        val isAddress = payload.wrapper.category == "address"

        try {
            if (isDocument) {
                indexDoc(context, docId, DocumentCategory.DATA)
            } else if (isAddress) {
                indexDoc(context, docId, DocumentCategory.ADDRESS)
                GlobalScope.launch {
                    indexReferencedDocs(context, docId)
                }
            }
        } catch (ex: Exception) {
            throw ClientException.withReason("Problem with indexing to Elasticsearch: ${ex.cause?.message}", ex)
        }

        return payload
    }

    private fun indexReferencedDocs(context: Context, docId: String) {
        context.addMessage(Message(this, "Index documents with referenced address $docId to Elasticsearch"))

        // get uuids from documents that reference the address
        val docsWithReferences = jdbcTemplate.queryForList<String>(
            """
            SELECT DISTINCT d.uuid 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.uuid = d.uuid
                AND d.state = 'PUBLISHED'
                AND dw.deleted = 0
                AND data->'pointOfContact' @> '[{"ref": "$docId"}]');
            """.trimIndent(),
        )

        docsWithReferences.forEach { indexDoc(context, it, DocumentCategory.DATA) }
    }

    private fun indexDoc(context: Context, docId: String, category: DocumentCategory) {
        context.addMessage(Message(this, "Index document $docId to Elasticsearch"))
        indexingTask.updateDocument(context.catalogId, category, docId)
    }
}
