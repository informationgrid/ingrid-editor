package de.ingrid.igeserver.persistence.model

import com.fasterxml.jackson.databind.JsonNode

/**
 * Base interface for all entity types
 */
interface EntityType {

    companion object {
        private const val CATEGORY = "data"
    }

    /**
     * The category of the entity type.
     */
    val category: String
        get() = CATEGORY

    /**
     * The class name used in the application/database
     */
    val className: String

    /**
     * The list of profiles using the entity type.
     * NOTE Empty array means *all profiles*, null means *no profile*
     */
    val profiles: Array<String>?

    /**
     * Check if the entity type is used in the given profile.
     */
    fun usedInProfile(profileId: String): Boolean {
        return profiles != null && (profiles!!.isEmpty() || profileId in profiles!!)
    }

    /**
     * Extract referenced documents/addresses and replace them with their ID
     */
    fun handleLinkedFields(doc: JsonNode): List<JsonNode> {
        return emptyList()
    }

    /**
     * Replace document/address references with their latest version
     */
    fun mapLatestDocReference(doc: JsonNode, onlyPublished: Boolean) {}
}