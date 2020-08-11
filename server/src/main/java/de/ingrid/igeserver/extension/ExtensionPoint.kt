package de.ingrid.igeserver.extension

/**
 * Interface for extension points provided by the application
 */
interface ExtensionPoint<T: Extension> {

    /**
     * Identifier of the extension point
     */
    val id: String

    /**
     * List of extensions that are registered at the extension point
     */
    val extensions: List<T>
}