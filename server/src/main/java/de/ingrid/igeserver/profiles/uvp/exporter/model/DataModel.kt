package de.ingrid.igeserver.profiles.uvp.exporter.model

import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressRefModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.SpatialModel
import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.profiles.mcloud.exporter.model.KeyValueModel
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val _parent: String?,
    val pointOfContact: List<AddressRefModel>?,
    @JsonProperty("spatial") val spatials: List<SpatialModel>?,
) {
    var _eiaNumbers: List<UVPNumber> = emptyList()
    var eiaNumbers: List<KeyValueModel> = emptyList()
        @JsonProperty set(value) {
            _eiaNumbers = value.mapNotNull {
                val entry = codelistHandler?.getCodelistEntry("9000", it.key!!)
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
            field = value
        }
    
    var _steps: List<Step> = emptyList()
    var processingSteps: List<JsonNode>? = null 
        @JsonProperty set(nodeSteps) {
            _steps = nodeSteps?.mapNotNull { step ->
                val type = step.get("type").textValue()
                when (type) {
                    "publicDisclosure" -> jacksonObjectMapper().treeToValue(step, Step1::class.java) // Step1
                    "publicHearing" -> jacksonObjectMapper().treeToValue(step, Step2::class.java) // Step1
                    "decisionOfAdmission" -> jacksonObjectMapper().treeToValue(step, Step3::class.java) // Step1
                    else -> {null}
                }
            }!!
            field = nodeSteps
        }

    companion object {
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }
}

data class UVPNumber(val uvpg: String, val type: String, val category: String)

interface Step

@JsonIgnoreProperties(ignoreUnknown = true)
data class Step1(val type: String, val disclosureDate: Any, val announcementDocs: Any, val applicationDocs: Any, val reportsRecommendationDocs: Any, val furtherDocs: Any) : Step

@JsonIgnoreProperties(ignoreUnknown = true)
data class Step2(val type: String) : Step

@JsonIgnoreProperties(ignoreUnknown = true)
data class Step3(val type: String) : Step