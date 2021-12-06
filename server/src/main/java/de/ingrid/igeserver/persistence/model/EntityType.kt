package de.ingrid.igeserver.persistence.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory

/**
 * Base interface for all entity types
 */
abstract class EntityType {

    companion object {
        private val CATEGORY = DocumentCategory.DATA
    }

    /**
     * Category of the entity type
     */
    open val category: String
        get() = CATEGORY.value

    /**
     * Class name used in the application/database
     */
    abstract val className: String

    /**
     * List of profiles using the entity type
     *
     * NOTE Empty array means *all profiles*, null means *no profile*
     */
    abstract val profiles: Array<String>?

    /**
     * Check if the entity type is used in the given profile
     */
    open fun usedInProfile(profileId: String): Boolean {
        return profiles != null && (profiles!!.isEmpty() || profileId in profiles!!)
    }

    /**
     * Persistence hook called when an instance of this type is created
     */
    open fun onCreate(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is updated
     */
    open fun onUpdate(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is published
     */
    open fun onPublish(doc: Document) {}

    /**
     * Persistence hook called when an instance of this type is deleted
     */
    open fun onDelete(doc: Document) {}

    /**
     * Extract referenced documents/addresses and replace them with their ID
     */
    open fun pullReferences(doc: Document): List<Document> {
        return emptyList()
    }

    /**
     * Replace document/address references with their latest version
     */
    open fun updateReferences(doc: Document, onlyPublished: Boolean) {}



    /**
     * Extract referenced uploads
     */
    open fun getUploads(doc: Document): List<String> {
        return emptyList()
    }
}
