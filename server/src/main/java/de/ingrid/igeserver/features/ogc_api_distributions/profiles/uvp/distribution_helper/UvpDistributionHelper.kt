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
package de.ingrid.igeserver.features.ogc_api_distributions.profiles.uvp.distribution_helper

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper.DistributionTypeInfo
import de.ingrid.igeserver.features.ogc_api_distributions.distribution_helper.OgcDistributionHelper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.storage.Storage
import net.pwall.json.schema.parser.Parser.Companion.isZero
import org.jetbrains.kotlin.utils.addToStdlib.ifFalse
import org.springframework.stereotype.Service

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

    override fun getDistributionDetails(document: Document, collectionId: String, recordId: String, distributionId: String?): JsonNode {
        val allDistributions: JsonNode = document.data.get("processingSteps")

        return if(distributionId.isNullOrEmpty()) {
            allDistributions
        } else {
            val matchedDistributions = mutableListOf<Any>()
            allDistributions.forEach {
                val processStep = it
                val type = processStep.getString("type")

                if(type == "publicHearing") {
                    val docTypeList: List<String> = listOf("considerationDocs")
                    docTypeList.forEach { docType ->
                        val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)
                        if (updatedProcessStep is JsonNode) {
                            val requestedInfo = PublicHearing(
                                type = updatedProcessStep.getString("type")!!,
                                publicHearingDate = updatedProcessStep.get("publicHearingDate"),
                                considerationDocs = updatedProcessStep.get("considerationDocs")
                            )
                            matchedDistributions.add(requestedInfo)
                        }
                    }
                }

                if(type == "decisionOfAdmission") {
                    val docTypeList: List<String> = listOf("approvalDocs", "decisionDocs")
                    docTypeList.forEach { docType ->
                        val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)
                        if (updatedProcessStep is JsonNode) {
                            val approvalDocs = updatedProcessStep.get("approvalDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }
                            val decisionDocs = updatedProcessStep.get("decisionDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }

                            if (approvalDocs.isNotEmpty()) {
                                val requestedInfo = DecisionOfAdmissionApprovalDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    decisionDate = updatedProcessStep.getString("decisionDate")!!,
                                    approvalDocs = approvalDocs
                                )
                                matchedDistributions.add(requestedInfo)
                            }

                            if (decisionDocs.isNotEmpty()) {
                                val requestedInfo = DecisionOfAdmissionDecisionDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    decisionDate = updatedProcessStep.getString("decisionDate")!!,
                                    decisionDocs = decisionDocs
                                )
                                matchedDistributions.add(requestedInfo)
                            }
                        }
                    }
                }

                if(type == "publicDisclosure") {
                    val docTypeList: List<String> = listOf("furtherDocs", "applicationDocs", "announcementDocs", "reportsRecommendationDocs")
                    docTypeList.forEach { docType ->
                        val updatedProcessStep = removeUnwantedInfos(distributionId, docType, processStep)
                        if (updatedProcessStep is JsonNode) {
                            val furtherDocs = updatedProcessStep.get("furtherDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }
                            val applicationDocs = updatedProcessStep.get("applicationDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }
                            val announcementDocs = updatedProcessStep.get("announcementDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }
                            val reportsRecommendationDocs = updatedProcessStep.get("reportsRecommendationDocs").filter { doc -> doc.getString("downloadURL.uri") == distributionId }

                            if (furtherDocs.isNotEmpty()) {
                                val requestedInfo = PublicDisclosureFurtherDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    disclosureDate = updatedProcessStep.get("disclosureDate"),
                                    furtherDocs = furtherDocs,
                                    furtherDocsPublishDuringDisclosure = updatedProcessStep.getBoolean("furtherDocsPublishDuringDisclosure")!!
                                )
                                matchedDistributions.add(requestedInfo)
                            }

                            if (applicationDocs.isNotEmpty()) {
                                val requestedInfo = PublicDisclosureApplicationDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    disclosureDate = updatedProcessStep.get("disclosureDate"),
                                    applicationDocs = applicationDocs,
                                    applicationDocsPublishDuringDisclosure = updatedProcessStep.getBoolean("applicationDocsPublishDuringDisclosure")!!
                                )
                                matchedDistributions.add(requestedInfo)
                            }

                            if (announcementDocs.isNotEmpty()) {
                                val requestedInfo = PublicDisclosureAnnouncementDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    disclosureDate = updatedProcessStep.get("disclosureDate"),
                                    announcementDocs = announcementDocs,
                                    announcementDocsPublishDuringDisclosure = updatedProcessStep.getBoolean("announcementDocsPublishDuringDisclosure")!!
                                )
                                matchedDistributions.add(requestedInfo)
                            }

                            if (reportsRecommendationDocs.isNotEmpty()) {
                                val requestedInfo = PublicDisclosureReportsRecommendationDocs(
                                    type = updatedProcessStep.getString("type")!!,
                                    disclosureDate = updatedProcessStep.get("disclosureDate"),
                                    reportsRecommendationDocs = applicationDocs,
                                    reportsRecommendationDocsPublishDuringDisclosure = updatedProcessStep.getBoolean("reportsRecommendationDocsPublishDuringDisclosure")!!
                                )
                                matchedDistributions.add(requestedInfo)
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

        distributions.forEach { distribution ->
            val type = distribution.getString("type")
            when (type) {
                "publicHearing" -> {
                    distribution["considerationDocs"].forEach { doc ->
                        collectMissingFiles(doc, collectionId, userID, recordId, missingFiles)
                    }
                }

                "decisionOfAdmission" -> {
                    (distribution["approvalDocs"] + distribution["decisionDocs"]).forEach { doc ->
                        collectMissingFiles(doc, collectionId, userID, recordId, missingFiles)
                    }
                }

                "publicDisclosure" -> {
                    (distribution["furtherDocs"] + distribution["applicationDocs"] + distribution["announcementDocs"] + distribution["reportsRecommendationDocs"]).forEach { doc ->
                        collectMissingFiles(doc, collectionId, userID, recordId, missingFiles)
                    }
                }
            }
        }

        return missingFiles
    }

    private fun collectMissingFiles(
        doc: JsonNode,
        collectionId: String,
        userID: String,
        recordId: String,
        missingFiles: MutableList<String>
    ) {
        val currentDistributionId = doc.getString("downloadURL.uri")!!
        val isLink = doc.getBoolean("downloadURL.asLink")!!
        isLink.ifFalse {
            val distributionExists = storage.exists(collectionId, userID, recordId, currentDistributionId)
            distributionExists.ifFalse { missingFiles.add(currentDistributionId) }
        }
    }

    private fun removeUnwantedInfos(distributionId: String, docType: String, processStep: JsonNode): JsonNode?  {
        val jsonNodeList = processStep.get(docType).filter {
            it.getString("downloadURL.uri") == distributionId
        }
        if (jsonNodeList.size.isZero()) return null

        val jsonNode: JsonNode = convertListToJsonNode(jsonNodeList as List<Any>)
        (processStep as ObjectNode).replace(docType, jsonNode)
        return processStep
    }

    private fun convertListToJsonNode(listOfJsonNodes: List<Any>): JsonNode =
        jacksonObjectMapper().valueToTree(listOfJsonNodes)

}
