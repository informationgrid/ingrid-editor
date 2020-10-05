package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.document.UvpType

open class BaseUvpType : UvpType {

    companion object {
        @JvmStatic
        protected val TYPE = "UvpDoc"
        @JvmStatic
        protected val PROFILES = arrayOf("uvp")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}