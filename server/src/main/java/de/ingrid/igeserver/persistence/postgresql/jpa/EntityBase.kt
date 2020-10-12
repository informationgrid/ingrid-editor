package de.ingrid.igeserver.persistence.postgresql.jpa

import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.MappedSuperclass

/**
 * Base class for all entities
 */
@MappedSuperclass
open class EntityBase {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    var id: Int? = null
}