package de.ingrid.igeserver.extension

/**
 * Interface for extensions that can be registered at extension points
 */
interface Extension {

    /**
     * Identifier of the extension
     */
    val id: String

    /**
     * List of profiles using the extension
     *
     * NOTE Empty array means *all profiles*, null means *no profile*
     */
    val profiles: Array<String>?
}