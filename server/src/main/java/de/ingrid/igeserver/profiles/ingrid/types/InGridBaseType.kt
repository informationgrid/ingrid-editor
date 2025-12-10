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
package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
abstract class InGridBaseType(val jdbcTemplate: JdbcTemplate) : EntityType() {
    override val profiles = arrayOf("ingrid")

    override fun getReferenceUUIDs(doc: Document): List<String> = doc.data.path("pointOfContact").map { address ->
        address.path("ref").textValue()
    }

    override fun getIncomingReferenceUUIDs(doc: Document, options: List<String>): List<String> {
        val sqlQuery = getIncomingReferenceQuery(doc, options)
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    override fun getIncomingReferenceQuery(doc: Document, options: List<String>): String = """
            SELECT DISTINCT document1.uuid
            FROM document document1, document_wrapper
            WHERE (
                document_wrapper.deleted = 0
                AND document_wrapper.catalog_id = ${doc.catalog!!.id}
                AND document_wrapper.catalog_id = document1.catalog_id
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
                AND (
                    data->'service'->'coupledResources' @> '[{"uuid": "${doc.uuid}", "isExternalRef": false}]' 
    ${if (!options.contains("onlyInCoupledResources")) {
        """
                    OR data->'references' @> '[{"uuidRef": "${doc.uuid}"}]' 
                    OR data->'parentIdentifier' @> (jsonb('"${doc.uuid}"'))
        """.trimIndent()
    } else {
        ""
    }})
                    
                )
    """.trimIndent()

    override fun getUploads(doc: Document): List<String> {
        val graphicOverviews: List<String> = doc.data.get("graphicOverviews")?.let {
            getUploadsFromFileList(it, "fileName")
        } ?: emptyList()

        val fileReferences: List<String> = doc.data.get("fileReferences")?.let {
            getUploadsFromFileList(it, "link")
        } ?: emptyList()

        return graphicOverviews + fileReferences
    }
}
