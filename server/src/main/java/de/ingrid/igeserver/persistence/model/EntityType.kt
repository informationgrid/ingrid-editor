/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.InitiatorAction
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
     * When a document type is inherited, we can set the inherited className.
     * This is used when getting inherited context help
     */
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
    open fun usedInProfile(profileId: String): Boolean = profiles != null && (profiles!!.isEmpty() || profileId in profiles!!)

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
     * Get all referenced document UUIDs
     */
    open fun getReferenceUUIDs(doc: Document): List<String> = emptyList()

    /**
     * Get all document UUIDs which reference this document
     */
    open fun getIncomingReferenceUUIDs(doc: Document, options: List<String> = emptyList<String>()): List<String> = emptyList()

    // TODO: evaluate refactoring with builder pattern
    open fun getIncomingReferenceQuery(doc: Document, options: List<String> = emptyList<String>()): String = ""

    /**
     * Extract referenced uploads
     */
    open fun getUploads(doc: Document): List<String> = emptyList()

    protected fun getUploadsFromFileList(fileList: JsonNode?, field: String = "downloadURL"): List<String> = fileList
        ?.filter { it.get(field)?.get("asLink")?.asBoolean()?.not() ?: true }
        ?.map { it.get(field).get("uri").textValue() }
        ?: emptyList()
}
