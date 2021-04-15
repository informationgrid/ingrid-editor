package de.ingrid.igeserver.persistence.model

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory

/**
 * Base interface for all entity types
 */
interface EntityType {

    companion object {
        private val CATEGORY = DocumentCategory.DATA
    }

    /**
     * Category of the entity type
     */
    val category: String
        get() = CATEGORY.value

    /**
     * Class name used in the application/database
     */
    val className: String

    /**
     * List of profiles using the entity type
     *
     * NOTE Empty array means *all profiles*, null means *no profile*
     */
    val profiles: Array<String>?

    /**
     * Check if the entity type is used in the given profile
     */
    fun usedInProfile(profileId: String): Boolean {
        return profiles != null && (profiles!!.isEmpty() || profileId in profiles!!)
    }

    /**
     * Persistence hook called when an instance of this type is created
     */
    fun onCreate(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is updated
     */
    fun onUpdate(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is published
     */
    fun onPublish(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is deleted
     */
    fun onDelete(doc: Document) {}

    /**
     * Extract referenced documents/addresses and replace them with their ID
     */
    fun pullReferences(doc: Document): List<Document> {
        return emptyList()
    }

    /**
     * Replace document/address references with their latest version
     */
    fun updateReferences(doc: Document, onlyPublished: Boolean) {}
}