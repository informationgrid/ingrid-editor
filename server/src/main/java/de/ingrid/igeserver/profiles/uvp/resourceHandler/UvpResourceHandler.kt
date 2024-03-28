package de.ingrid.igeserver.profiles.uvp.resourceHandler

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ogc.resourceHandler.OgcResourceHandler
import de.ingrid.igeserver.ogc.resourceHandler.ResourceTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import de.ingrid.igeserver.persistence.filter.publish.PreJsonSchemaValidator
import net.pwall.json.schema.output.BasicOutput
import net.pwall.json.schema.parser.Parser.Companion.isZero
import org.springframework.web.multipart.MultipartFile

@Profile("ogc-resources-api & uvp")
@Service
class UvpResourceHandler(): OgcResourceHandler {
    override val typeInfo: ResourceTypeInfo
        get() = ResourceTypeInfo(
            "uvp",
            "UVP",
            "UVP Resource Handler",
            emptyList()
        )

    override fun canHandleResource(profile: String): Boolean {
        return "uvp" == profile
    }

    override fun addResource(document: Document, resourceId: String?, files: List<MultipartFile>): Document {
        val type = "type"
        if(type == "publicHearing") {
//            val endDate = resourceInfo.get("publicHearingDate").get("end")
//            resourceInfo.get("considerationsDocs").forEach() {
//                val uri = it.get("downloadURL").get("uri")
//                // check if uri does not yet exist in DOCUMENT
//                if (it.get("downloadURL").get("asLink").asBoolean() == true) {
//                    // save resource (with LINK) to DOCUMENT
//                } else {
//                    // check if FILE exists -> save it
//                    // save resource to DOCUMENT
//                }
//            }
        }

        if(type == "decisionOfAdmission") {

        }

        if(type == "publicDisclosure") {

        }

        return document
//        val objectMapper: ObjectMapper = jacksonObjectMapper().registerKotlinModule()
//        val downloadURL: ObjectNode = objectMapper.createObjectNode().apply {
//            put("uri", resourceId)
//            put("value", resourceId)
//            put("asLink", false)
//        }
//        val newResourceInfo: ObjectNode = objectMapper.createObjectNode().apply {
//            put("title", resourceId)
//            // put("validUntil", "2024-03-27T23:00:00.000Z")
//            set<ObjectNode>("downloadURL", downloadURL)
//        }
//        val docResourceInfo = getResourceDetails(document, null)
//        if (docResourceInfo.isArray) (docResourceInfo as ArrayNode).add(newResourceInfo)
//        return document
    }

    override fun deleteResource(document: Document, resourceId: String): Document {
        val docResourceInfo = getResourceDetails(document, null)
        val iterator = docResourceInfo.iterator()
        while (iterator.hasNext()) {
            val node = iterator.next()
            val uri = node.get("downloadURL")?.get("uri")?.asText()
            if (uri == resourceId) {
                iterator.remove()
            }
        }
        return document
    }


    override fun getResourceDetails(document: Document, resourceId: String?): JsonNode {
        val allResources = document.data.get("processingSteps")
        return if(resourceId.isNullOrEmpty()) {
            allResources as ArrayNode
        } else {
            val objectMapper = ObjectMapper()
            val matchedResources: ArrayNode = objectMapper.createArrayNode()
            allResources.forEach() {
                val processStep = it
                val type = processStep.get("type").textValue()

                if(type == "publicHearing") {
                    val docTypeList: List<String> = listOf("considerationDocs")
                    docTypeList.forEach() {
                        val docType = it
                        val excludedDocTypes = docTypeList.filter { it == docType }
                        val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep, excludedDocTypes)
                        when (updatedProcessStep) {
                            is JsonNode -> matchedResources.add(updatedProcessStep)
                        }
                    }
                }

                if(type == "decisionOfAdmission") {
                    val docTypeList: List<String> = listOf("approvalDocs", "decisionDocs")
                    docTypeList.forEach() {
                        val docType = it
                        val excludedDocTypes = docTypeList.filter { it == docType }
                        val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep, excludedDocTypes)
                        when (updatedProcessStep) {
                            is JsonNode -> matchedResources.add(updatedProcessStep)
                        }
                    }
                }

                if(type == "publicDisclosure") {
                    val docTypeList: List<String> = listOf("furtherDocs", "applicationDocs", "announcementDocs", "reportsRecommendationDocs")
                    docTypeList.forEach() {
                        val docType = it
                        val excludedDocTypes = docTypeList.filter { it == docType }
                        val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep, excludedDocTypes)
                        when (updatedProcessStep) {
                            is JsonNode -> matchedResources.add(updatedProcessStep)
                        }
                    }
                }

            }
            return matchedResources as JsonNode
        }
    }

    private fun removeUnwantedInfos(resourceId: String, docType: String, processStep: JsonNode, excludedDocTypes: List<String>): JsonNode?  {
        excludedDocTypes.forEach() {
            // remove unwanted doc types
        }
        val jsonNodeList = processStep.get(docType).filter() {
            it.get("downloadURL").get("uri").textValue() == resourceId
        }
        if (jsonNodeList.size.isZero()) return null

        val jsonNode: JsonNode = convertListToJsonNode(jsonNodeList)
        (processStep as ObjectNode).replace(docType, jsonNode)
        return processStep
    }

    fun convertListToJsonNode(listOfJsonNodes: List<JsonNode>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        val arrayNode: ArrayNode = objectMapper.createArrayNode()

        listOfJsonNodes.forEach { jsonNode ->
            arrayNode.add(jsonNode)
        }
        return arrayNode
    }

}
