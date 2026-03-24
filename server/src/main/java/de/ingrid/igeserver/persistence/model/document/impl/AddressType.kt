/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.exceptions.IsReferencedException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.DocStateFilter
import de.ingrid.igeserver.persistence.model.document.IncomingReferenceOptions
import de.ingrid.igeserver.persistence.model.document.SimpleIncomingReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class AddressType(val jdbcTemplate: JdbcTemplate) : EntityType() {

    @Autowired
    lateinit var codelistHandler: CodelistHandler

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf<String>()

    override val className = "AddressDoc"

    val referenceFieldsInDocuments = listOf("addresses")

    override fun onDelete(doc: Document) {
        super.onDelete(doc)
        val result = this.getIncomingReferenceUUIDs(doc, SimpleIncomingReferenceOptions(docStateFilter = DocStateFilter.ALL_STATES))

        if (result.isNotEmpty()) {
            throw IsReferencedException.byUuids(result)
        }
    }

    override fun onUnpublish(doc: Document) {
        super.onUnpublish(doc)
        val result = getIncomingReferenceUUIDs(doc, SimpleIncomingReferenceOptions(docStateFilter = DocStateFilter.PENDING_OR_PUBLISHED))

        if (result.isNotEmpty()) {
            throw IsReferencedException.addressByPublishedDatasets(result)
        }
    }

    override fun getIncomingReferenceUUIDs(doc: Document, options: IncomingReferenceOptions): List<String> {
        val sqlQuery = getIncomingReferenceQuery(doc, options)
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    override fun getIncomingReferenceQuery(
        doc: Document,
        options: IncomingReferenceOptions,
    ): String = """
                SELECT DISTINCT document1.uuid
                FROM document document1, document_wrapper
                WHERE (
                    document_wrapper.deleted = 0
                    AND document_wrapper.catalog_id = ${doc.catalog!!.id}
                    AND document_wrapper.uuid = document1.uuid
                    AND ( ${options.docStateFilter.toSql()} )
                    AND ( ${
        referenceFieldsInDocuments.joinToString(separator = " OR ", transform = { field ->
            "data->'$field' @> '[{\"ref\": \"${doc.uuid}\"}]'"
        })
    })
                   )
    """.trimIndent()
}
