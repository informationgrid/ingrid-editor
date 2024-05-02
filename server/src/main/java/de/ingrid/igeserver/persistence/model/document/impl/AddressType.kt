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
package de.ingrid.igeserver.persistence.model.document.impl

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
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

    val referenceFieldInDocuments = "addresses"

    override fun onCreate(doc: Document, initiator: InitiatorAction) {
        super.onCreate(doc, initiator)

        var address = doc.data.get("address") as ObjectNode?
        if (address == null) {
            address = jacksonObjectMapper().createObjectNode()
            doc.data.set<JsonNode>("address", address)
        }
        if (address!!.get("administrativeArea") == null) {
            val value =
                convertIdToKeyValue(codelistHandler.getDefaultCatalogCodelistEntryId(doc.catalog?.identifier!!, "6250"))
            address.set<JsonNode>("administrativeArea", value)
        }
        if (address.get("country") == null) {
            val value = convertIdToKeyValue(codelistHandler.getDefaultCodelistEntryId("6200"))
            address.set<JsonNode>("country", value)
        }
    }

    private fun convertIdToKeyValue(codelistEntryId: String?): JsonNode? {
        if (codelistEntryId.isNullOrEmpty()) return null

        return jacksonObjectMapper().createObjectNode().apply {
            put("key", codelistEntryId)
        }
    }

    override fun onDelete(doc: Document) {
        super.onDelete(doc)
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw, catalog
            WHERE (
                dw.deleted = 0
                AND dw.uuid = d.uuid
                AND d.catalog_id = ${doc.catalog?.id}
                AND dw.catalog_id = ${doc.catalog?.id}
                AND (d.state = 'DRAFT' OR d.state = 'DRAFT_AND_PUBLISHED' OR d.state = 'PENDING' OR d.state = 'PUBLISHED')
                AND data->'${referenceFieldInDocuments}' @> '[{"ref": "${doc.uuid}"}]');
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        if (result.size > 0) {
            throw IsReferencedException.byUuids(result.map { it["uuid"] as String })
        }
    }

    override fun onUnpublish(doc: Document) {
        super.onUnpublish(doc)
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.deleted = 0
                AND dw.catalog_id = ${doc.catalog!!.id}
                AND dw.uuid = d.uuid
                AND (d.state = 'PENDING' OR d.state = 'PUBLISHED')
                AND data->'${referenceFieldInDocuments}' @> '[{"ref": "${doc.uuid}"}]');
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        if (result.size > 0) {
            throw IsReferencedException.addressByPublishedDatasets(result.map { it["uuid"] as String })
        }
    }

    override fun getIncomingReferenceIds(doc: Document): List<String> {
        // only return published documents. as this is used for export. and specificaly not for prePublish Check
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.deleted = 0
                AND dw.catalog_id = ${doc.catalog!!.id}
                AND dw.uuid = d.uuid
                AND d.state = 'PUBLISHED'
                AND data->'${referenceFieldInDocuments}' @> '[{"ref": "${doc.uuid}"}]');
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }
}
