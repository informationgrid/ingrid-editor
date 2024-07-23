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
package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
abstract class InGridBaseType(val jdbcTemplate: JdbcTemplate) : EntityType() {
    override val profiles = arrayOf("ingrid")

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        return replaceWithReferenceUuid(doc, "pointOfContact")
    }

    override fun getReferenceIds(doc: Document): List<String> {
        return doc.data.path("pointOfContact").map { address ->
            address.path("ref").textValue()
        }
    }

    override fun getIncomingReferenceIds(doc: Document): List<String> {
        // only return published documents. as this is used for export. and specifically not for prePublish Check
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.deleted = 0
                AND dw.catalog_id = ${doc.catalog!!.id}
                AND dw.catalog_id = d.catalog_id
                AND dw.uuid = d.uuid
                AND d.state = 'PUBLISHED'
                AND (
                    data->'service'->'coupledResources' @> '[{"uuid": "${doc.uuid}", "isExternalRef": false}]' 
                    OR data->'references' @> '[{"uuidRef": "${doc.uuid}"}]' 
                    OR data->'parentIdentifier' @> (jsonb('"${doc.uuid}"')))
                )
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    override fun getUploads(doc: Document): List<String> {
        return doc.data.get("graphicOverviews")?.let {
            getUploadsFromFileList(it, "fileName")
        } ?: emptyList()
    }
}
