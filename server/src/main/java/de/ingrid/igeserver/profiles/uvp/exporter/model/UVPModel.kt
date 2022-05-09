package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.profiles.mcloud.exporter.model.AddressModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.KeyValueModel
import de.ingrid.igeserver.profiles.mcloud.exporter.model.SpatialModel
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

@JsonIgnoreProperties(ignoreUnknown = true)
data class UVPModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_type") val type: String,
    val title: String,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
) {

    val spatialTitle = data.spatials?.get(0)?.title

    var documentType = mapDocumentType()

    private fun mapDocumentType(): String {
        return when (type) {
            "UvpApprovalProcedureDoc" -> "10"
            "UvpNegativePreliminaryAssessmentDoc" -> "12"
            "UvpForeignProjectDoc" -> "11"
            "UvpSpatialPlanningProcedureDoc" -> "13"
            "UvpLineDeterminationDoc" -> "14"
            else -> throw ServerException.withReason("Could not map document type: $type")
        }
    }

    val parentUuid: String? = data._parent
    val pointOfContact: AddressModel?
        get() {
            return data.pointOfContact
                ?.firstOrNull()
                ?.ref
        }

    fun getSpatial(): String? {
        return data.spatials
            ?.map { prepareSpatialString(it) }
            ?.getOrNull(0)
    }

    fun getSpatial(field: String): Float? {
        val value = getSpatialBoundingBox() ?: return null

        return when (field) {
            "lat1" -> value.lat1
            "lon1" -> value.lon1
            "lat2" -> value.lat2
            "lon2" -> value.lon2
            else -> null
        }
    }

    private fun getSpatialBoundingBox(): SpatialModel.BoundingBoxModel? {
        return data.spatials
            ?.getOrNull(0)
            ?.value
    }

    fun getSpatialLonCenter(): Float? {
        val bbox = getSpatialBoundingBox() ?: return null
        return bbox.lat1 + (bbox.lon1 - bbox.lat1) / 2;
    }

    fun getSpatialLatCenter(): Float? {
        val bbox = getSpatialBoundingBox() ?: return null
        return bbox.lat2 + (bbox.lon2 - bbox.lat2) / 2;
    }

    private fun prepareSpatialString(spatial: SpatialModel): String {
        var coordinates =
            "${spatial.value?.lon1}, ${spatial.value?.lat1}, ${spatial.value?.lon2}, ${spatial.value?.lat2}"
        if (spatial.title != null) {
            coordinates = "${spatial.title}: $coordinates"
        }
        return coordinates
    }

    val steps = data.steps

    fun getStepsAsPhases(): List<String> {
        return steps
            .map {
                when (it) {
                    is StepPublicDisclosure -> "phase1"
                    is StepPublicHearing -> "phase2"
                    is StepDecisionOfAdmission -> "phase3"
                    else -> "???"
                }
            }
    }

    fun getDecisionDate(): List<String> {
        return data.steps
            .filterIsInstance<StepDecisionOfAdmission>()
            .map { OffsetDateTime.parse(it.decisionDate) }
            .map { it.format(formatterNoSeparator) }
    }

    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }


    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String {
        if (entry == null) return ""

        if (entry.key == null) return entry.value!!

        return codelistHandler?.getCodelistValue(codelistId, entry.key) ?: "???"
    }

    fun getUvpNumbers(): List<UVPNumber> {
        return data.uvpNumbers
    }

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private val formatterOnlyDate = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    private val formatterNoSeparator = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSS");
    val modified: String
        get() {
            return _modified.format(formatterOnlyDate)
        }

    fun modifiedAsString(): String {
        return _modified.format(formatterNoSeparator)
    }

    fun getPostBoxString() : String {
        return "Postbox ${pointOfContact?.address?.poBox}, ${pointOfContact?.address?.zipPoBox ?: pointOfContact?.address?.poBox} ${getCodelistValue("6200", pointOfContact?.address?.country)}"
    }
    
    fun hasPoBox(): Boolean = !pointOfContact?.address?.poBox.isNullOrEmpty()

    fun getUvpAddressParents(): List<String> {
        if (pointOfContact == null) return emptyList()

        return pointOfContact!!.getParentAddresses(pointOfContact!!.id)
            .map { convertToReadableAddressFromJson(it.data) }
    }

    private fun convertToReadableAddressFromJson(address: ObjectNode): String {
        val organization = address.get("organization")
        return if (organization == null) {
            getPersonStringFromJson(address)
        } else {
            organization.textValue()
        }
    }

    private fun getPersonStringFromJson(address: ObjectNode): String {
        val mapper = jacksonObjectMapper()
        return listOfNotNull(
            getCodelistValue(
                "4300",
                mapper.convertValue(address.get("salutation"), KeyValueModel::class.java)
            ),
            getCodelistValue(
                "4305",
                mapper.convertValue(address.get("academicTitle"), KeyValueModel::class.java)
            ),
            address.get("firstName").textValue(),
            address.get("lastName").textValue()
        ).joinToString(" ")
    }

}
