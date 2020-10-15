package de.ingrid.igeserver.persistence.postgresql.jpa.model

/**
 * Interface for entities that maintain a uuid
 */
interface EntityWithUuid {

    val uuid: String?
}