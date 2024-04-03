package de.ingrid.igeserver.profiles.uvp.resourceHandler

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.resourceHandler.OgcResourceHandler
import de.ingrid.igeserver.ogc.resourceHandler.ResourceTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import net.pwall.json.schema.parser.Parser.Companion.isZero

data class PublicHearing(
    val type: String,
    val considerationDocs: JsonNode,
    val publicHearingDate: JsonNode
)
data class DecisionOfAdmissionDecisionDocs(
    val type: String,
    val decisionDate: String,
    val decisionDocs: List<JsonNode>
)
data class DecisionOfAdmissionApprovalDocs(
    val type: String,
    val decisionDate: String,
    val approvalDocs: List<JsonNode>
)
data class PublicDisclosureFurtherDocs(
    val type: String,
    val disclosureDate: JsonNode,
    val furtherDocs: List<JsonNode>,
    val furtherDocsPublishDuringDisclosure: Boolean,
)
data class PublicDisclosureApplicationDocs(
    val type: String,
    val disclosureDate: JsonNode,
    val applicationDocs: List<JsonNode>,
    val applicationDocsPublishDuringDisclosure: Boolean,
)
data class PublicDisclosureAnnouncementDocs(
    val type: String,
    val disclosureDate: JsonNode,
    val announcementDocs: List<JsonNode>,
    val announcementDocsPublishDuringDisclosure: Boolean,
)
data class PublicDisclosureReportsRecommendationDocs(
    val type: String,
    val disclosureDate: JsonNode,
    val reportsRecommendationDocs: List<JsonNode>,
    val reportsRecommendationDocsPublishDuringDisclosure: Boolean,
)

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

    override fun deleteResource(document: Document, resourceId: String): Document {
        // TODO("Remove information about resource from document")
//        val docResourceInfo = getResourceDetails(document, null)
//        val iterator = docResourceInfo.iterator()
//        while (iterator.hasNext()) {
//            val node = iterator.next()
//            val uri = node.get("downloadURL")?.get("uri")?.asText()
//            if (uri == resourceId) {
//                iterator.remove()
//            }
//        }
        return document
    }


    override fun getResourceDetails(baseUrl: String, document: Document, collectionId: String, recordId: String, resourceId: String?): JsonNode {

        val allResources: JsonNode = document.data.get("processingSteps")
        allResources.forEach() { resource ->
            val type = resource.get("type").textValue()
            if(type == "publicHearing") {
                resource["considerationDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
            }
            if(type == "decisionOfAdmission") {
                resource["approvalDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
                resource["decisionDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
            }
            if(type == "publicDisclosure") {
                resource["furtherDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
                resource["applicationDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
                resource["announcementDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
                resource["reportsRecommendationDocs"].forEach() { doc -> addLinkToResources(baseUrl, collectionId, recordId, doc) }
            }
        }

        return if(resourceId.isNullOrEmpty()) {
            allResources
        } else {
            val matchedResources = mutableListOf<Any>()
            allResources.forEach() {
                val processStep = it
                val type = processStep.get("type").textValue()

                if(type == "publicHearing") {
                    val docTypeList: List<String> = listOf("considerationDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep)) {
                            is JsonNode -> {
                                val requestedInfo = PublicHearing(
                                    type = updatedProcessStep.get("type").textValue(),
                                    publicHearingDate = updatedProcessStep.get("publicHearingDate"),
                                    considerationDocs = updatedProcessStep.get("considerationDocs")
                                )
                                matchedResources.add(requestedInfo)
                            }
                        }
                    }
                }

                if(type == "decisionOfAdmission") {
                    val docTypeList: List<String> = listOf("approvalDocs", "decisionDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep)) {
                            is JsonNode -> {
                                val approvalDocs = updatedProcessStep.get("approvalDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }
                                val decisionDocs = updatedProcessStep.get("decisionDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }

                                if (approvalDocs.isNotEmpty()) {
                                    val requestedInfo = DecisionOfAdmissionApprovalDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        decisionDate = updatedProcessStep.get("decisionDate").textValue(),
                                        approvalDocs = approvalDocs
                                    )
                                    matchedResources.add(requestedInfo)
                                }

                                if (decisionDocs.isNotEmpty()) {
                                    val requestedInfo = DecisionOfAdmissionDecisionDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        decisionDate = updatedProcessStep.get("decisionDate").textValue(),
                                        decisionDocs = decisionDocs
                                    )
                                    matchedResources.add(requestedInfo)
                                }
                            }
                        }
                    }
                }

                if(type == "publicDisclosure") {
                    val docTypeList: List<String> = listOf("furtherDocs", "applicationDocs", "announcementDocs", "reportsRecommendationDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(resourceId, docType, processStep)) {
                            is JsonNode -> {
                                val furtherDocs = updatedProcessStep.get("furtherDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }
                                val applicationDocs = updatedProcessStep.get("applicationDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }
                                val announcementDocs = updatedProcessStep.get("announcementDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }
                                val reportsRecommendationDocs = updatedProcessStep.get("reportsRecommendationDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == resourceId }

                                if (furtherDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureFurtherDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        furtherDocs = furtherDocs,
                                        furtherDocsPublishDuringDisclosure = updatedProcessStep.get("furtherDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedResources.add(requestedInfo)
                                }

                                if (applicationDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureApplicationDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        applicationDocs = applicationDocs,
                                        applicationDocsPublishDuringDisclosure = updatedProcessStep.get("applicationDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedResources.add(requestedInfo)
                                }

                                if (announcementDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureAnnouncementDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        announcementDocs = announcementDocs,
                                        announcementDocsPublishDuringDisclosure = updatedProcessStep.get("announcementDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedResources.add(requestedInfo)
                                }

                                if (reportsRecommendationDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureReportsRecommendationDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        reportsRecommendationDocs = applicationDocs,
                                        reportsRecommendationDocsPublishDuringDisclosure = updatedProcessStep.get("reportsRecommendationDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedResources.add(requestedInfo)
                                }

                            }
                        }
                    }
                }

            }
            return convertListToJsonNode(matchedResources as List<Any>)
        }
    }

    private fun removeUnwantedInfos(resourceId: String, docType: String, processStep: JsonNode): JsonNode?  {
        val jsonNodeList = processStep.get(docType).filter() {
            it.get("downloadURL").get("uri").textValue() == resourceId
        }
        if (jsonNodeList.size.isZero()) return null

        val jsonNode: JsonNode = convertListToJsonNode(jsonNodeList as List<Any>)
        (processStep as ObjectNode).replace(docType, jsonNode)
        return processStep
    }

    fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        return objectMapper.valueToTree(listOfJsonNodes)
    }

    fun addLinkToResources(baseUrl: String, collectionId: String, recordId: String, doc: JsonNode ) {
        val resourceId = doc["downloadURL"]["uri"].textValue()
        val isLink = doc["downloadURL"]["asLink"].asBoolean()
        val link =  "$baseUrl/api/ogc/collections/$collectionId/items/$recordId/resources/download?uri=$resourceId"
        if (!isLink) (doc["downloadURL"] as ObjectNode).put("url", link)
    }

}
