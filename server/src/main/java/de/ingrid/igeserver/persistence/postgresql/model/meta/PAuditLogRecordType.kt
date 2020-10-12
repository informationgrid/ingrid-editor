package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseAuditLogRecordType
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.AuditLogRecord
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PAuditLogRecordType : BaseAuditLogRecordType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = AuditLogRecordType::class

    override val jpaType: KClass<out EntityBase>
        get() = AuditLogRecord::class
}