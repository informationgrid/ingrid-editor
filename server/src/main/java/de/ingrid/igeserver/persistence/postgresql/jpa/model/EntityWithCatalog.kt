package de.ingrid.igeserver.persistence.postgresql.jpa.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog

/**
 * Interface for entities that maintain a relation to a catalog
 */
interface EntityWithCatalog {

    var catalog: Catalog?
}