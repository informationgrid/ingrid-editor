/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.exceptions.IsReferencedException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.InitiatorAction
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

    override fun onCreate(doc: Document, initiator: InitiatorAction) {
        super.onCreate(doc, initiator)

        var address = doc.data.get("address") as ObjectNode?
        if (address == null) {
            address = jacksonObjectMapper().createObjectNode()
            doc.data.set<JsonNode>("address", address)
        }
        if (address!!.get("administrativeArea") == null) {
            val codelistEntry = codelistHandler.getDefaultCatalogCodelistEntry(doc.catalog?.identifier!!, "6250")
            val value =
                convertIdToKeyValue(codelistEntry, "6250")
            if (value != null) address.set<JsonNode>("administrativeArea", value)
        }
        if (address.get("country") == null) {
            val codelistEntry = codelistHandler.getDefaultCatalogCodelistEntry(doc.catalog?.identifier!!, "6200")
            val value = convertIdToKeyValue(codelistEntry, "6200")
            if (value != null) address.set<JsonNode>("country", value)
        }
    }

    private fun convertIdToKeyValue(codelistEntry: CodeListEntry?, codelistId: String): JsonNode? {
        if (codelistEntry == null) return null

        return jacksonObjectMapper().createObjectNode().apply {
            put("key", codelistEntry.id)
            // TODO: use catalog language
            put("value", codelistEntry.fields["de"])
            put("_codelistId", codelistId)
        }
    }

    override fun onDelete(doc: Document) {
        super.onDelete(doc)
        val result = this.getIncomingReferenceUUIDs(doc, listOf("allStates"))

        if (result.isNotEmpty()) {
            throw IsReferencedException.byUuids(result)
        }
    }

    override fun onUnpublish(doc: Document) {
        super.onUnpublish(doc)
        val result = getIncomingReferenceUUIDs(doc, listOf("pendingOrPublished"))

        if (result.isNotEmpty()) {
            throw IsReferencedException.addressByPublishedDatasets(result)
        }
    }

    override fun getIncomingReferenceUUIDs(doc: Document, options: List<String>): List<String> {
        val sqlQuery = getIncomingReferenceQuery(doc, options)
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    override fun getIncomingReferenceQuery(
        doc: Document,
        options: List<String>,
    ): String = """
                SELECT DISTINCT document1.uuid
                FROM document document1, document_wrapper
                WHERE (
                    document_wrapper.deleted = 0
                    AND document_wrapper.catalog_id = ${doc.catalog!!.id}
                    AND document_wrapper.uuid = document1.uuid
                    AND ${
        if (options.contains("onlyPublished")) {
            "document1.state = 'PUBLISHED'"
        } else if (options.contains("pendingOrPublished")) {
            "(document1.state = 'PENDING' OR document1.state = 'PUBLISHED')"
        } else if (options.contains("allStates")) {
            "(document1.state = 'DRAFT' OR document1.state = 'DRAFT_AND_PUBLISHED' OR document1.state = 'PENDING' OR document1.state = 'PUBLISHED')"
        } else {
            // get latest
            "document1.is_latest = true"
        }
    }
                    AND ( ${
        referenceFieldsInDocuments.joinToString(separator = " OR ", transform = { field ->
            "data->'$field' @> '[{\"ref\": \"${doc.uuid}\"}]'"
        })
    })
                   )
    """.trimIndent()
}
