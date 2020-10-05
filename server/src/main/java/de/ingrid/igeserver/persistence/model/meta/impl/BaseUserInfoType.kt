package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.UserInfoType

open class BaseUserInfoType : UserInfoType {

    companion object {
        @JvmStatic
        protected val TYPE = "Info"
    }

    override val profiles: Array<String>?
        get() = null

    override val className: String
        get() = TYPE
}