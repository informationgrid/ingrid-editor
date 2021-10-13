package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.exceptions.IsReferencedException
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class AddressType : EntityType() {

    @Autowired
    lateinit var jdbcTemplate: JdbcTemplate

    companion object {
        @JvmStatic
        protected val CATEGORY = DocumentCategory.ADDRESS

        @JvmStatic
        protected val TYPE = "AddressDoc"

        @JvmStatic
        protected val PROFILES = arrayOf<String>()
    }

    override val category: String
        get() = CATEGORY.value

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override fun onDelete(doc: Document) {
        super.onDelete(doc)
        val sqlQuery = """
            SELECT DISTINCT d.uuid, title 
            FROM document d, document_wrapper dw 
            WHERE (
                (dw.draft = d.id OR dw.published = d.id) 
                AND data->'addresses' @> '[{"ref": "${doc.uuid}"}]');
            """.trimIndent()
        val result = jdbcTemplate.queryForList(sqlQuery)

        if (result.size > 0) {
            throw IsReferencedException.byUuids(result.map { it["uuid"] as String })
        }
    }
}
