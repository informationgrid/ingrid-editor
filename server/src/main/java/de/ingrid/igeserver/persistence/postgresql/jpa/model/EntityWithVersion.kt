package de.ingrid.igeserver.persistence.postgresql.jpa.model

/**
 * Interface for entities that maintain a version number for concurrency control
 */
interface EntityWithVersion {

    var version: Int?
}