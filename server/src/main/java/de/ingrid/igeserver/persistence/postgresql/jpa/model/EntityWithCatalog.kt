package de.ingrid.igeserver.persistence.postgresql.jpa.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog

/**
 * Interface for entities that maintain a relation to a catalog that will be set to the current catalog
 * when persisting the entity
 */
interface EntityWithCatalog {

    var catalog: Catalog?
}