package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressRefModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.KeyValueModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.RangeModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.SpatialModel
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.time.LocalDate
import java.time.ZoneId
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val _parent: String?,
    val pointOfContact: List<AddressRefModel>?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
    val receiptDate: String?,
    val decisionDate: String?,
    val prelimAssessment: Boolean = false,
    val uvpNegativeDecisionDocs: List<Document>?,
    val eiaNumbers: List<KeyValueModel>

    ) {
    var uvpNumbers: List<UVPNumber> = emptyList()
    fun convertEiaNumbers(catalogId: String) {
        uvpNumbers = eiaNumbers.mapNotNull {
            val uvpCodelistId = behaviourService?.get(catalogId, "plugin.uvp.eia-number")?.data?.get("uvpCodelist")?.toString() ?: "9000"
            val entry = codelistHandler?.getCodelistEntry(uvpCodelistId, it.key!!)
            if (entry != null) {
                val codeValue = entry.fields["de"] ?: "???"
                val data = jacksonObjectMapper().readTree(entry.data)
                UVPNumber(
                    codeValue,
                    data.get("type").textValue(),
                    data.get("cat").textValue()
                )
            } else {
                null
            }
        }
    }

    var steps: List<Step> = emptyList()
    private fun setProcessingSteps(nodeSteps: List<JsonNode>) {
        steps = nodeSteps.mapNotNull { step ->
            val type = step.get("type").textValue()
            when (type) {
                "publicDisclosure" -> jacksonObjectMapper().treeToValue(
                    step,
                    StepPublicDisclosure::class.java
                ) // Step1
                "publicHearing" -> jacksonObjectMapper().treeToValue(step, StepPublicHearing::class.java) // Step1
                "decisionOfAdmission" -> jacksonObjectMapper().treeToValue(
                    step,
                    StepDecisionOfAdmission::class.java
                ) // Step1
                else -> {
                    null
                }
            }
        }
    }

    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
        val behaviourService: BehaviourService? by lazy {
            SpringContext.getBean(BehaviourService::class.java)
        }
    }
}

data class UVPNumber(val uvpg: String, val type: String, val category: String)

interface Step

@JsonIgnoreProperties(ignoreUnknown = true)
data class StepPublicDisclosure(
    val type: String,
    val disclosureDate: RangeModel,
    val announcementDocs: List<Document>?,
    val announcementDocsPublishDuringDisclosure: Boolean = true,
    val applicationDocs: List<Document>?,
    val applicationDocsPublishDuringDisclosure: Boolean = true,
    val reportsRecommendationDocs: List<Document>?,
    val reportsRecommendationDocsPublishDuringDisclosure: Boolean = true,
    val furtherDocs: List<Document>?,
    val furtherDocsPublishDuringDisclosure: Boolean = true
) : Step {
    fun isPublishable(tableName: String): Boolean {
        val today = Date().toInstant().toString()
        val startDate = disclosureDate.start ?: today
        return when (tableName) {
            "announcementDocs" -> !announcementDocsPublishDuringDisclosure || startDate <= today
            "applicationDocs" -> !applicationDocsPublishDuringDisclosure || startDate <= today
            "reportsRecommendationDocs" -> !reportsRecommendationDocsPublishDuringDisclosure || startDate <= today
            "furtherDocs" -> !furtherDocsPublishDuringDisclosure || startDate <= today
            else -> true
        }

    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class StepPublicHearing(
    val type: String,
    val considerationDocs: List<Document>?
) : Step {

    var publicHearingDate: RangeModel? = null
        set(value) {
            field = value ?: RangeModel(null, null)
        }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class StepDecisionOfAdmission(
    val type: String,
    val decisionDate: String,
    val approvalDocs: List<Document>?,
    val decisionDocs: List<Document>?
) : Step

@JsonIgnoreProperties(ignoreUnknown = true)
data class Document(val title: String, val downloadURL: DownloadUrl, val validUntil: Date?) {

    /**
     * Document is not expired when validUntil date is not set or date is before today
     */
    fun isNotExpired() = validUntil == null || !LocalDate.now().isAfter(LocalDate.ofInstant(validUntil.toInstant(), ZoneId.systemDefault()))

}

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadUrl(val uri: String, val asLink: Boolean)
