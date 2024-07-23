/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence.model

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.convertToDocument
import de.ingrid.igeserver.utils.getRawJsonFromDocument
import de.ingrid.igeserver.utils.getString
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy


/**
 * Base interface for all entity types
 */
abstract class EntityType {

    private val logger = logger()

    companion object {
        private val CATEGORY = DocumentCategory.DATA
    }

    @Autowired
    @Lazy
    protected lateinit var documentService: DocumentService


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
     * When a document type is inherited then we must name the inherited className.
     * This is used when getting inherited context help for example
     */
    @Deprecated("inherited document types should have the same className!!!", ReplaceWith("null"))
    open fun parentClassName(): String? = null

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
    open fun onCreate(doc: Document, initiator: InitiatorAction) {}

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
     * Persistence hook called when an instance of this type is deleted
     */
    open fun onUnpublish(doc: Document) {}

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
     * Get all document UUIDs which reference this document
     */
    open fun getIncomingReferenceIds(doc: Document): List<String> {
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

    private fun getDocumentForReferenceUuid(
        options: UpdateReferenceOptions,
        uuid: String,
    ): JsonNode {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(options.catalogId!!, uuid)
        val documentData = documentService.getDocumentFromCatalog(options.catalogId, wrapper.id!!).also {
            if (!options.forExport) {
                it.document.data.put(FIELD_TAGS, wrapper.tags.joinToString(","))
            }
        }

        // TODO AW: the extra mapping should not be needed once addresses will be loaded explicitly
        return if (options.forExport) {
            getRawJsonFromDocument(documentData.document, true)
        } else getRawJsonFromDocument(documentData.document).apply {
            put(FIELD_UUID, uuid)
            put(FIELD_STATE, documentData.document.state.getState())
            put(FIELD_DOCUMENT_TYPE, documentData.document.type)
            put(FIELD_CREATED, documentData.document.created.toString())
            put(FIELD_MODIFIED, documentData.document.modified.toString())
            put(FIELD_CONTENT_MODIFIED, documentData.document.contentmodified.toString())
            put(FIELD_ID, documentData.wrapper.id)
            put(FIELD_PARENT, documentData.wrapper.id)
        }
    }

    protected fun getUploadsFromFileList(fileList: JsonNode?, field: String = "downloadURL"): List<String> {
        return fileList
            ?.filter { it.get(field)?.get("asLink")?.asBoolean()?.not() ?: true }
            ?.map { it.get(field).get("uri").textValue() }
            ?: emptyList()
    }

    // TODO AW: use function by all profiles
    fun replaceWithReferenceUuid(doc: Document, fieldId: String): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path(fieldId)
        for (address in addresses) {
            val addressJson = address.path("ref")
            // during import address already is replaced by UUID
            // TODO: improve import process so we don't need this
            if (addressJson is ObjectNode) {
                val uuid = addressJson.path(FIELD_UUID).textValue()
                val addressDoc = convertToDocument(addressJson, addressJson.getString(FIELD_DOCUMENT_TYPE), null, addressJson.getString(
                    FIELD_UUID))
                addressDocs.add(addressDoc)
                (address as ObjectNode).put("ref", uuid)
            }
        }
        return addressDocs
    }

    fun replaceUuidWithReferenceData(doc: Document, fieldId: String, options: UpdateReferenceOptions) {
        val addresses = doc.data.path(fieldId)
        for (address in addresses) {
            val uuid = if (address.path("ref").isTextual) {
                address.path("ref").asText()
            } else {
                // fix used because references have not been saved with ID but full address
                // this can be removed later
                logger.warn("Address reference is stored in a wrong way")
                address.path("ref").path(FIELD_UUID).asText()
            }
            try {
                val latestDocumentJson = getDocumentForReferenceUuid(options, uuid)
                (address as ObjectNode).replace("ref", latestDocumentJson)
            } catch (ex: NotFoundException) {
                // TODO: what to do with removed references?
                logger.error("Referenced address was not found: $uuid -> Should we remove it from '${doc.uuid}'?")
                throw ServerException.withReason("Document '${doc.uuid}' has a reference that could not be resolved: $uuid")
            }
        }
    }
}

data class UpdateReferenceOptions(
    val onlyPublished: Boolean = false,
    val forExport: Boolean = false,
    val catalogId: String? = null
)
