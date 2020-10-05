package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseAuditLogRecordType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OAuditLogRecordType : BaseAuditLogRecordType(), OrientDBEntityType {

    override val entityType: KClass<out EntityType>
        get() = AuditLogRecordType::class

    override fun initialize(session: ODatabaseSession) {
        // we assume that initialization is done in OrientDBLog4JAppender
    }
}