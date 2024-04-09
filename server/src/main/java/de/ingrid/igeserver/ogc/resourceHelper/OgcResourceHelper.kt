/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.ogc.resourceHelper

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile

@Profile("ogc-resources-api")
interface OgcResourceHelper {

    val typeInfo: ResourceTypeInfo

    /**
     * Request information about specific resource and/or all resources of a document.
     * @param document is Ige Document
     * @param resourceId is URI of a resource (file uri or link uri)
     * @return JsonNode with info about resource & ArrayNode of resources of document
     */
    fun getResourceDetails(baseUrl: String?, document: Document, collectionId: String, recordId: String, resourceId: String?): JsonNode

    /**
     * Check if files exist AND if resources are listed in document.
     * @param resources JsonNode with info about resource & ArrayNode of resources of document
     * @param collectionId is catalog identifier
     * @param userID is user identifier
     * @param recordId is document identifier
     * @param resourceId is URI of a resource (file uri or link uri)
     * @return List of missing files (URIs).
     */
    fun searchForMissingFiles(resources: JsonNode, collectionId: String, userID: String, recordId: String, resourceId: String?): List<String>

    /**
     * Check if a given resource can be handled by this resource helper.
     * This is needed to automatically determine which resource helper can be used.
     *
     * @param profile is the file type
     * @param fileContent is the content of the file as a simple string
     * @return true if resource can be handled, otherwise false
     */
    fun canHandleResource(profile: String): Boolean
}