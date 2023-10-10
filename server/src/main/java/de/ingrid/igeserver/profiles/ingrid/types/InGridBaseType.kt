package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
abstract class InGridBaseType @Autowired constructor(val jdbcTemplate: JdbcTemplate) : EntityType() {
    override val profiles = arrayOf("ingrid")

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
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
                AND dw.uuid = d.uuid
                AND d.state = 'PUBLISHED'
                AND (data->'service'->'coupledResources' @> '[{"uuid": "${doc.uuid}", "isExternalRef": false}]' OR data->'references' @> '[{"uuidRef": "${doc.uuid}"}]')
                )
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        return result.map { it["uuid"] as String }
    }

    private fun updateAddresses(doc: Document, options: UpdateReferenceOptions) {
        return replaceUuidWithReferenceData(doc, "pointOfContact", options)
    }

    override fun getUploads(doc: Document): List<String> {
        return doc.data.get("graphicOverviews")?.let {
            getUploadsFromFileList(it, "fileName")
        } ?: emptyList()
    }
}
