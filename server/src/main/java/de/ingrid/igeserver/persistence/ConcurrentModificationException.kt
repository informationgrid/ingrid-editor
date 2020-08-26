package de.ingrid.igeserver.persistence

/**
 * An exception signaling that an object could not be updated in the database, because
 * the database version of the object is newer.
 */
open class ConcurrentModificationException(message: String, val id: String, val databaseVersion: Int, val recordVersion: Int) : PersistenceException(message)