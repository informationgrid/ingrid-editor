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

    override fun addResource(document: Document, resourceId: String?, resourceInfo: JsonNode, files: List<MultipartFile>): Document {
        val objectMapper = jacksonObjectMapper()
        val resourceInfoAsString = objectMapper.writeValueAsString(resourceInfo)
        val schema = "/uvp/schemes/refs/processing-steps-default.schema.json"
        PreJsonSchemaValidator().validate(schema, resourceDataAsString)

        val type = resourceInfo.get("type")
        if(type == "publicHearing") {
            val endDate = resourceInfo.get("publicHearingDate").get("end")
            resourceInfo.get("considerationsDocs").forEach() {
                val uri = it.get("downloadURL").get("uri")
                // check if uri does not yet exist in DOCUMENT
                if (it.get("downloadURL").get("asLink").asBoolean() == true) {
                    // save resource (with LINK) to DOCUMENT
                } else {
                    // check if FILE exists -> save it
                    // save resource to DOCUMENT
                }
            }
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
        val allResources = (document.data.get("processingSteps").get(0) as ObjectNode).get("considerationDocs")
        return if(resourceId.isNullOrEmpty()) {
            allResources as ArrayNode
        } else {
            val resourceInfo = allResources.filter { it.get("downloadURL").get("uri").textValue() == resourceId.toString() }
            resourceInfo[0]
        }
    }

}
