package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.BehaviourType

open class BaseBehaviourType : BehaviourType {

    companion object {
        @JvmStatic
        protected val TYPE = "Behaviours"
        @JvmStatic
        protected val PROFILES = null
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override val className: String
        get() = TYPE
}