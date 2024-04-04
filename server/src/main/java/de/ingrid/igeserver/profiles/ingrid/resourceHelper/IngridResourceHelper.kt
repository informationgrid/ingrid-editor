package de.ingrid.igeserver.profiles.bmi.resourceHelper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.resourceHelper.OgcResourceHelper
import de.ingrid.igeserver.ogc.resourceHelper.ResourceTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ogc-resources-api & ingrid")
@Service
class IngridResourceHelper(): OgcResourceHelper {

    override val typeInfo: ResourceTypeInfo
        get() = ResourceTypeInfo(
            "ingrid",
            "Ingrid",
            description = "Ingrid Resource Helper",
            emptyList()
        )

    override fun canHandleResource(profile: String): Boolean {
        return "ingrid" == profile
    }

    override fun resourceExistsInDoc(document: Document, resourceId: String): Boolean {
        val docData: String = document.data.toString()
        val string = "\"$resourceId\","
        return docData.contains(string)
    }

    override fun getResourceDetails(baseUrl: String, document: Document, collectionId: String, recordId: String, resourceId: String?): JsonNode {
        val allResources = document.data["graphicOverviews"]
        allResources.forEach() { resource -> addLinkToResources( baseUrl, collectionId, recordId, resource )}

        return if (resourceId.isNullOrEmpty()) {
            allResources
        } else {
            val filteredResources = allResources.filter() { it["fileName"]["uri"].textValue() == resourceId }
            convertListToJsonNode(filteredResources)
        }
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        return objectMapper.valueToTree(listOfJsonNodes)
    }

    private fun addLinkToResources(baseUrl: String, collectionId: String, recordId: String, resource: JsonNode ) {
        val resourceId = resource["fileName"]["uri"].textValue()
        val isLink = resource["fileName"]["asLink"].asBoolean()
        val link =  "$baseUrl/api/ogc/collections/$collectionId/items/$recordId/resources/download?uri=$resourceId"
        if (!isLink) (resource["fileName"] as ObjectNode).put("url", link)
    }

}