package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.VersionInfoType

open class BaseVersionInfoType : VersionInfoType {

    companion object {
        @JvmStatic
        protected val TYPE = "version"
    }

    override val profiles: Array<String>?
        get() = null

    override val className: String
        get() = TYPE
}