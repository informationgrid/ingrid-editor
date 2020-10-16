package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithRecordId
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.MappedSuperclass

/**
 * Base class for all entities
 */
@MappedSuperclass
open class EntityBase : EntityWithRecordId {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @JsonProperty("db_id")
    override var id: Int? = null
}