package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OAuditLogRecordType : OrientDBEntityType {

    @Value("\${audit.log.table:null}")
    private var auditLogTable: String? = null

    override val profiles: Array<String>?
        get() = null

    override val className: String by lazy {
        if (auditLogTable.isNullOrEmpty()) {
            throw ConfigurationException.fromMissingValue("audit.log.table")
        }
        auditLogTable!!
    }

    override val entityType: KClass<out EntityType>
    get() = AuditLogRecordType::class

    override fun initialize(session: ODatabaseSession) {
        // we assume that initialization is done in OrientDBLog4JAppender
    }
}