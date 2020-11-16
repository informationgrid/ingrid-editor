package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType

open class BaseAuditLogRecordType : AuditLogRecordType {

    companion object {
        @JvmStatic
        protected val TYPE = "AuditLog"
        @JvmStatic
        protected val PROFILES = null
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override val className: String
        get() = TYPE
}