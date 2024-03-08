/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bmwk.extensions

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.queryForList
import org.springframework.stereotype.Component

@Component
class BmwkPublishExport(
    val docWrapperRepo: DocumentWrapperRepository,
    val jdbcTemplate: JdbcTemplate, val indexingTask: IndexingTask
) : Filter<PostPublishPayload> {
    override val profiles = arrayOf("ingrid-bmwk")

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {

        val docId = payload.document.uuid
        val docType = payload.document.type

        try {
            when (docType) {
                "BmiDoc" -> indexBmwkDoc(context, docId)
                "BmiAddressDoc" -> indexReferencesBmwkDocs(context, docId)
                else -> return payload
            }
        } catch (ex: NoNodeAvailableException) {
            throw ClientException.withReason("No connection to Elasticsearch: ${ex.message}")
        }

        return payload

    }

    private fun indexReferencesBmwkDocs(context: Context, docId: String) {
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
                AND data->'addresses' @> '[{"ref": "$docId"}]');
            """.trimIndent()
        )

        docsWithReferences.forEach { indexBmwkDoc(context, it) }

    }

    private fun indexBmwkDoc(context: Context, docId: String) {

        context.addMessage(Message(this, "Index document $docId to Elasticsearch"))
        indexingTask.updateDocument(context.catalogId, DocumentCategory.DATA, "indexInGridIDFBmwk", docId)

    }
}