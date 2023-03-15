package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

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
    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.GERMANY)
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd", Locale.GERMANY)
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS", Locale.GERMANY)

    var catalogId: String = ""
    val spatialTitle = data.spatials?.get(0)?.title

    var documentType = mapDocumentType()

    val contentField: MutableList<String> = mutableListOf()

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
    var pointOfContact: AddressModel? = null

    fun init(catalogId: String): UVPModel {
        this.catalogId = catalogId
        pointOfContact = determinePointOfContact()
        return this
    }

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }

    private fun determinePointOfContact(): AddressModel? {

        val ref = data.pointOfContact
            ?.firstOrNull()
            ?.ref ?: return null

//        val catalogId = AddressModel.catalogRepository?.getCatalogIdentifier(doc.catalog!!.id!!)!!
        val nonHiddenAddress = ref.getAncestorAddressesIncludingSelf(ref.id, catalogId)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else null

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

    fun getSpatialLatCenter(): Float? {
        val bbox = getSpatialBoundingBox() ?: return null
        return bbox.lat1 + (bbox.lat2 - bbox.lat1) / 2
    }

    fun getSpatialLonCenter(): Float? {
        val bbox = getSpatialBoundingBox() ?: return null
        return bbox.lon1 + (bbox.lon2 - bbox.lon1) / 2
    }

    private fun prepareSpatialString(spatial: SpatialModel): String {
        val coordinates =
            "${spatial.value?.lon1}, ${spatial.value?.lat1}, ${spatial.value?.lon2}, ${spatial.value?.lat2}"
        val title = spatial.title ?: ""
        return "${title}: $coordinates"
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

        val decisionDates = data.steps.filterIsInstance<StepDecisionOfAdmission>().map { it.decisionDate }.toMutableList()
        if (data.decisionDate != null) decisionDates += data.decisionDate

        return decisionDates
            .map { OffsetDateTime.parse(it) }
            .map { formatDate(formatterNoSeparator, it) }
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

    fun getUvpNumbers(): List<UVPNumber> = data.uvpNumbers

    fun getUvpCategories(): List<String> {
        return getUvpNumbers().map { it.category }.filter { it.isNotEmpty() }
    }

    fun getUvpCategoryTypes(): List<String> {
        return getUvpNumbers().map { it.type }.filter { it.isNotEmpty() }
    }

    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime) = formatter.format(Date.from(date.toInstant()))

    fun getPostBoxString(): String {
        return "Postbox ${pointOfContact?.address?.poBox}, ${pointOfContact?.address?.zipPoBox ?: pointOfContact?.address?.poBox} ${pointOfContact?.address?.city}"
    }

    fun hasPoBox(): Boolean = !pointOfContact?.address?.poBox.isNullOrEmpty()

    fun getUvpAddressParents(): List<AddressModel> =
        if (pointOfContact!!.parent == null) emptyList() else getUvpAddressParents(pointOfContact!!.parent!!)

    fun getUvpAddressParentsIncludingCurrent(): List<AddressShort> =
        if (pointOfContact == null) emptyList() else getUvpAddressParents(pointOfContact!!.id).map { getAddressShort(it) }

    private fun getUvpAddressParents(parent: Int?): List<AddressModel> {
        if (pointOfContact == null) return emptyList()

        return pointOfContact!!.getAncestorAddressesIncludingSelf(parent, catalogId)
    }


    fun getAddressShort(address: AddressModel): AddressShort {
        return if (address.organization == null) {
            AddressShort(address.uuid, getPersonStringFromJson(address))
        } else {
            AddressShort(address.uuid, address.organization)
        }
    }

    private fun getPersonStringFromJson(address: AddressModel): String {
        return listOfNotNull(
            getCodelistValue(
                "4300",
                address.salutation
            ),
            getCodelistValue(
                "4305",
                address.academicTitle
            ),
            address.firstName,
            address.lastName
        ).joinToString(" ")
    }

}

data class AddressShort(val uuid: String, val title: String)
