package de.ingrid.igeserver.ogc.resourceHandler

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile

@Profile("ogc-resources-api")
interface OgcResourceHandler {

    val typeInfo: ResourceTypeInfo

    /**
     * Execute the resource handler for a given data string.
     * @param document is Ige Document
     * @param resourceId is URI of a resource (file uri or link uri)
     * @param resourceData is information about a resource
     * @return Document with updated resource info (remove or add resource)
     */
    fun addResource(document: Document, resourceId: String, resourceData: String): Document // JsonNode

    /**
     * Request information about specific resource and/or all resources of a document.
     * @param document is Ige Document
     * @param resourceId is URI of a resource (file uri or link uri)
     * @return JsonNode with info about resource & ArrayNode of resources of document
     */
    fun getResourceDetails(document: Document, resourceId: String?): JsonNode

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