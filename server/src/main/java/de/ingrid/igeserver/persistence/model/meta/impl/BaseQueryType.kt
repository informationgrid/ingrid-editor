package de.ingrid.igeserver.persistence.model.meta.impl

import de.ingrid.igeserver.persistence.model.meta.BehaviourType

open class BaseQueryType : BehaviourType {
    override val profiles: Array<String>?
        get() = null
    
    override val className: String
        get() = "Query"
}