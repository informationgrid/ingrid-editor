package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.GroupType

open class BaseGroupType : GroupType {

    companion object {
        @JvmStatic
        protected val TYPE = "Group"
    }

    override val profiles: Array<String>?
        get() = null

    override val className: String
        get() = TYPE
}
