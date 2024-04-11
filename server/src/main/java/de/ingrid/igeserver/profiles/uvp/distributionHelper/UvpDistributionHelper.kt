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
package de.ingrid.igeserver.profiles.uvp.distributionHelper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.distributionHelper.OgcDistributionHelper
import de.ingrid.igeserver.ogc.distributionHelper.DistributionTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import net.pwall.json.schema.parser.Parser.Companion.isZero
import org.jetbrains.kotlin.utils.addToStdlib.ifFalse

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

@Profile("ogc-distributions-api & uvp")
@Service
class UvpDistributionHelper(
    private val storage: Storage
): OgcDistributionHelper {
    override val typeInfo: DistributionTypeInfo
        get() = DistributionTypeInfo(
            "uvp",
            "UVP",
            "UVP Distribution Helper",
            emptyList()
        )

    override fun canHandleDistribution(profile: String): Boolean {
        return "uvp" == profile
    }

    override fun getDistributionDetails(baseUrl: String?, document: Document, collectionId: String, recordId: String, distributionId: String?): JsonNode {


        val allDistributions: JsonNode = document.data.get("processingSteps")

        if (!baseUrl.isNullOrEmpty()) {
            allDistributions.forEach() { distribution ->
                val type = distribution.get("type").textValue()
                if(type == "publicHearing") {
                    distribution["considerationDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                }
                if(type == "decisionOfAdmission") {
                    distribution["approvalDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                    distribution["decisionDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                }
                if(type == "publicDisclosure") {
                    distribution["furtherDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                    distribution["applicationDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                    distribution["announcementDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                    distribution["reportsRecommendationDocs"].forEach() { doc -> addLinkToDistributions(baseUrl, collectionId, recordId, doc) }
                }
            }
        }

        return if(distributionId.isNullOrEmpty()) {
            allDistributions
        } else {
            val matchedDistributions = mutableListOf<Any>()
            allDistributions.forEach() {
                val processStep = it
                val type = processStep.get("type").textValue()

                if(type == "publicHearing") {
                    val docTypeList: List<String> = listOf("considerationDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)) {
                            is JsonNode -> {
                                val requestedInfo = PublicHearing(
                                    type = updatedProcessStep.get("type").textValue(),
                                    publicHearingDate = updatedProcessStep.get("publicHearingDate"),
                                    considerationDocs = updatedProcessStep.get("considerationDocs")
                                )
                                matchedDistributions.add(requestedInfo)
                            }
                        }
                    }
                }

                if(type == "decisionOfAdmission") {
                    val docTypeList: List<String> = listOf("approvalDocs", "decisionDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)) {
                            is JsonNode -> {
                                val approvalDocs = updatedProcessStep.get("approvalDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }
                                val decisionDocs = updatedProcessStep.get("decisionDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }

                                if (approvalDocs.isNotEmpty()) {
                                    val requestedInfo = DecisionOfAdmissionApprovalDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        decisionDate = updatedProcessStep.get("decisionDate").textValue(),
                                        approvalDocs = approvalDocs
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }

                                if (decisionDocs.isNotEmpty()) {
                                    val requestedInfo = DecisionOfAdmissionDecisionDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        decisionDate = updatedProcessStep.get("decisionDate").textValue(),
                                        decisionDocs = decisionDocs
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }
                            }
                        }
                    }
                }

                if(type == "publicDisclosure") {
                    val docTypeList: List<String> = listOf("furtherDocs", "applicationDocs", "announcementDocs", "reportsRecommendationDocs")
                    docTypeList.forEach() { docType ->
                        when (val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)) {
                            is JsonNode -> {
                                val furtherDocs = updatedProcessStep.get("furtherDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }
                                val applicationDocs = updatedProcessStep.get("applicationDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }
                                val announcementDocs = updatedProcessStep.get("announcementDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }
                                val reportsRecommendationDocs = updatedProcessStep.get("reportsRecommendationDocs").filter() { doc -> doc.get("downloadURL").get("uri").textValue() == distributionId }

                                if (furtherDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureFurtherDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        furtherDocs = furtherDocs,
                                        furtherDocsPublishDuringDisclosure = updatedProcessStep.get("furtherDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }

                                if (applicationDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureApplicationDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        applicationDocs = applicationDocs,
                                        applicationDocsPublishDuringDisclosure = updatedProcessStep.get("applicationDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }

                                if (announcementDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureAnnouncementDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        announcementDocs = announcementDocs,
                                        announcementDocsPublishDuringDisclosure = updatedProcessStep.get("announcementDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }

                                if (reportsRecommendationDocs.isNotEmpty()) {
                                    val requestedInfo = PublicDisclosureReportsRecommendationDocs(
                                        type = updatedProcessStep.get("type").textValue(),
                                        disclosureDate = updatedProcessStep.get("disclosureDate"),
                                        reportsRecommendationDocs = applicationDocs,
                                        reportsRecommendationDocsPublishDuringDisclosure = updatedProcessStep.get("reportsRecommendationDocsPublishDuringDisclosure").asBoolean()
                                    )
                                    matchedDistributions.add(requestedInfo)
                                }

                            }
                        }
                    }
                }

            }
            return convertListToJsonNode(matchedDistributions as List<Any>)
        }
    }

    override fun searchForMissingFiles(distributions: JsonNode, collectionId: String, userID: String, recordId: String, distributionId: String?): List<String> {
        val missingFiles: MutableList<String> = mutableListOf()

        distributions.forEach() { distribution ->
            val type = distribution.get("type").textValue()
            if(type == "publicHearing") {
                distribution["considerationDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
            }
            if(type == "decisionOfAdmission") {
                distribution["approvalDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
                distribution["decisionDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
            }
            if(type == "publicDisclosure") {
                distribution["furtherDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
                distribution["applicationDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
                distribution["announcementDocs"].forEach() { doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
                distribution["reportsRecommendationDocs"].forEach() {doc ->
                    val currentDistributionId = doc["downloadURL"]["uri"].textValue()
                    val isLink = doc["downloadURL"]["asLink"].asBoolean()
                    isLink.ifFalse {
                        val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
                        distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
                    }
                }
            }
        }

        return missingFiles
    }

    private fun removeUnwantedInfos(distributionId: String, docType: String, processStep: JsonNode): JsonNode?  {
        val jsonNodeList = processStep.get(docType).filter() {
            it.get("downloadURL").get("uri").textValue() == distributionId
        }
        if (jsonNodeList.size.isZero()) return null

        val jsonNode: JsonNode = convertListToJsonNode(jsonNodeList as List<Any>)
        (processStep as ObjectNode).replace(docType, jsonNode)
        return processStep
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode {
        val objectMapper: ObjectMapper = jacksonObjectMapper()
        return objectMapper.valueToTree(listOfJsonNodes)
    }

    private fun addLinkToDistributions(baseUrl: String, collectionId: String, recordId: String, doc: JsonNode ) {
        val distributionId = doc["downloadURL"]["uri"].textValue()
        val isLink = doc["downloadURL"]["asLink"].asBoolean()
        val link =  "$baseUrl/api/ogc/collections/$collectionId/items/$recordId/distributions/download?uri=$distributionId"
        if (!isLink) (doc["downloadURL"] as ObjectNode).put("url", link)
    }

}
