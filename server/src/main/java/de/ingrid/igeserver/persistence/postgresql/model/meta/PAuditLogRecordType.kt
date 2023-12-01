package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component

/**
 * EmbeddedData type used by AuditLogRecord instances
 */
@Component
class AuditLogRecordData(
    val cat: String? = null,
    val action: String? = null,
    val actor: String? = null,
    val time: String? = null,
    val target: String? = null,
    val data: JsonNode? = null,
    val record_type: String? = null,
    val catalogIdentifier: String? = null
) {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "AuditLog"
    }

}