package de.ingrid.igeserver.ogc.resourceHandler

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile
import org.springframework.web.multipart.MultipartFile

@Profile("ogc-resources-api")
interface OgcResourceHandler {

    val typeInfo: ResourceTypeInfo

    /**
     * Request information about specific resource and/or all resources of a document.
     * @param document is Ige Document
     * @param resourceId is URI of a resource (file uri or link uri)
     * @return JsonNode with info about resource & ArrayNode of resources of document
     */
    fun getResourceDetails(baseUrl: String, document: Document, collectionId: String, recordId: String, resourceId: String?): JsonNode

    /**
     * Delete information about specific resource.
     * @param document is Ige Document
     * @param resourceId is URI of a resource (file uri or link uri)
     * @return Document without resource (resource with resourceId has been removed)
     */
    fun deleteResource(document: Document, resourceId: String): Document

    /**
     * Check if a given resource can be handled by this resource handler.
     * This is needed to automatically determine which resource handler can be used.
     *
     * @param profile is the file type
     * @param fileContent is the content of the file as a simple string
     * @return true if resource can be handled, otherwise false
     */
    fun canHandleResource(profile: String): Boolean
}