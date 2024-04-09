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
package de.ingrid.igeserver.profiles.bmi.resourceHelper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.resourceHelper.OgcResourceHelper
import de.ingrid.igeserver.ogc.resourceHelper.ResourceTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.mdek.upload.storage.Storage
import org.jetbrains.kotlin.utils.addToStdlib.ifFalse
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ogc-resources-api & bmi")
@Service
class BmiResourceHelper(
    private val storage: Storage
): OgcResourceHelper {

    override val typeInfo: ResourceTypeInfo
        get() = ResourceTypeInfo(
            "bmi",
            "BMI",
            description = "BMI Resource Helper",
            emptyList()
        )

    override fun canHandleResource(profile: String): Boolean {
        return "bmi" == profile
    }

    override fun getResourceDetails(baseUrl: String?, document: Document, collectionId: String, recordId: String, resourceId: String?): JsonNode {
        val allResources = document.data["distributions"]

        if (!baseUrl.isNullOrEmpty()) {
            allResources.forEach() { resource -> addLinkToResources( baseUrl, collectionId, recordId, resource )}
        }

        return if (resourceId.isNullOrEmpty()) {
            allResources
        } else {
            val filteredResources = allResources.filter() { it["link"]["uri"].textValue() == resourceId }
            convertListToJsonNode(filteredResources)
        }
    }

    override fun searchForMissingFiles(
        resources: JsonNode,
        collectionId: String,
        userID: String,
        recordId: String,
        resourceId: String?
    ): List<String> {
        val missingFiles: MutableList<String> = mutableListOf()

        resources.forEach() { resource ->
            val currentResourceId = resource["link"]["uri"].textValue()
            val isLink = resource["link"]["asLink"].asBoolean()
            isLink.ifFalse {
                val resourceExists = storage.exists(collectionId, userID, recordId, currentResourceId)
                resourceExists.ifFalse { missingFiles.add(currentResourceId) }
            }
        }
        return missingFiles
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        return objectMapper.valueToTree(listOfJsonNodes)
    }

    private fun addLinkToResources(baseUrl: String, collectionId: String, recordId: String, resource: JsonNode ) {
        val resourceId = resource["link"]["uri"].textValue()
        val isLink = resource["link"]["asLink"].asBoolean()
        val link =  "$baseUrl/api/ogc/collections/$collectionId/items/$recordId/resources/download?uri=$resourceId"
        if (!isLink) (resource["link"] as ObjectNode).put("url", link)
    }

}