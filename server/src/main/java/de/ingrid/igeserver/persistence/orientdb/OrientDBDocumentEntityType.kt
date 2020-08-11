package de.ingrid.igeserver.persistence.orientdb

/**
 * All database classes used for *catalog content* must implement this interface.
 *
 * NOTE: All classes must use the @Component annotation to be discoverable by OrientDBDatabase.
 */
interface OrientDBDocumentEntityType : OrientDBEntityType