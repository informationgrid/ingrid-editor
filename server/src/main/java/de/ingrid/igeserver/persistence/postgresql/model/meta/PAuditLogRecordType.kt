package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseAuditLogRecordType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AuditLogRecord
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PAuditLogRecordType : BaseAuditLogRecordType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = AuditLogRecordType::class

    override val jpaType: KClass<out EntityBase>
        get() = AuditLogRecord::class
}

@Component
class AuditLogRecordData(
        val cat: String? = null,
        val action: String? = null,
        val actor: String? = null,
        val time: String? = null,
        val target: String? = null,
        val data: JsonNode? = null
) : HashMap<String, Any?>(mapOf("cat" to cat, "action" to action, "actor" to actor, "time" to time,
        "target" to target, "data" to data)), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "AuditLog"
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}