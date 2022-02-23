package de.ingrid.igeserver.persistence.model

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired




/**
 * Base interface for all entity types
 */
abstract class EntityType {

    companion object {
        private val CATEGORY = DocumentCategory.DATA
    }

    @Autowired
    lateinit var documentService: DocumentService


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
     * Location of the json schema file to be used for validation
     */
    open val jsonSchema: String? = null

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
     * Get all referenced document UUIDs
     */
    open fun getReferenceIds(doc: Document): List<String> {
        return emptyList()
    }

    /**
     * Replace document/address references with their latest version
     */
    open fun updateReferences(doc: Document, options: UpdateReferenceOptions) {}


    /**
     * Extract referenced uploads
     */
    open fun getUploads(doc: Document): List<String> {
        return emptyList()
    }

    fun getDocumentForReferenceUuid(catalogId: String, uuid: String, options: UpdateReferenceOptions): JsonNode {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
        val latestDocument = documentService.getLatestDocument(wrapper, options.onlyPublished, catalogId = catalogId)
        val latestDocumentJson = documentService.convertToJsonNode(latestDocument)

        if (options.forExport) {
            documentService.removeInternalFieldsForImport(latestDocumentJson as ObjectNode)
        }
        return latestDocumentJson
    }
}

data class UpdateReferenceOptions(
    val onlyPublished: Boolean = false,
    val forExport: Boolean = false
)
