package de.ingrid.igeserver.extension

/**
 * Interface for extensions that can be registered at extension points
 */
interface Extension {

    /**
     * Identifier of the extension
     */
    val id: String
}