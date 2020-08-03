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
     * NOTE Empty array means *all profiles*, null means *no profile* (effectively deactivating the filter).
     * If the array is not empty, the extension should *only* be used for profiles contained in the profile list.
     */
    val profiles: Array<String>?

    /**
     * Check if the extension is used in the given profile
     * @param profileId Name of the profile (null, if unspecified)
     */
    fun usedInProfile(profileId: String?): Boolean {
        return profiles != null // not deactivated
                && (
                    // no profiles specified for extension -> match all given profiles
                    profiles!!.isEmpty() ||
                    // profiles specified for extension -> match only specific profile
                    profiles!!.isNotEmpty() && profileId in profiles!!
                )
    }
}