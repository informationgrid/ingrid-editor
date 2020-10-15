package de.ingrid.igeserver.persistence.postgresql.jpa.model

/**
 * Interface for entities that maintain a database record id
 */
interface EntityWithRecordId {

    val id: Int?
}