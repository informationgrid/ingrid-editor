package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import javax.persistence.EntityManager

open class IgeEntity {
    
    open var id: Int? = null
    
    open fun getByIdentifier(entityManager: EntityManager, identifier: String?): IgeEntity? {
        return null
    }

    open fun beforePersist(entityManager: EntityManager) {}
}