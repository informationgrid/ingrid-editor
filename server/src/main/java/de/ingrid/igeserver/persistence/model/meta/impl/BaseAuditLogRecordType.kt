package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import org.springframework.beans.factory.annotation.Value

open class BaseAuditLogRecordType : AuditLogRecordType {

    @Value("\${audit.log.table:null}")
    private var auditLogTable: String? = null

    override val profiles: Array<String>?
        get() = null

    override val className: String by lazy {
        if (auditLogTable.isNullOrEmpty()) {
            throw ConfigurationException.withMissingValue("audit.log.table")
        }
        auditLogTable!!
    }
}