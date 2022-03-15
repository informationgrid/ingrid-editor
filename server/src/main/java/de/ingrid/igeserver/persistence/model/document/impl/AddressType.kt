package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.exceptions.IsReferencedException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class AddressType @Autowired constructor(val jdbcTemplate: JdbcTemplate) : EntityType() {

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf<String>()

    override val className = "AddressDoc"

    override fun onDelete(doc: Document) {
        super.onDelete(doc)
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw 
            WHERE (
                dw.deleted = 0 AND
                (dw.draft = d.id OR dw.published = d.id OR dw.pending = d.id) 
                AND data->'addresses' @> '[{"ref": "${doc.uuid}"}]');
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
                dw.deleted = 0 AND
                (dw.pending = d.id OR dw.published = d.id) 
                AND data->'addresses' @> '[{"ref": "${doc.uuid}"}]');
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        if (result.size > 0) {
            throw IsReferencedException.byUuids(result.map { it["uuid"] as String })
        }
    }
}
