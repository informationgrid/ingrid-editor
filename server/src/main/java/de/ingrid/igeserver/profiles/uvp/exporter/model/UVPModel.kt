/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.AddressTransformerConfig
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentData
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue
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
    @JsonDeserialize(using = DateDeserializer::class)
    val _contentModified: OffsetDateTime,
) {
    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")

    var catalogId: String = ""
    val spatialTitle = data.spatials?.get(0)?.title

    var documentType = mapDocumentType()

    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(): String = when (type) {
        "UvpApprovalProcedureDoc" -> "10"
        "UvpNegativePreliminaryAssessmentDoc" -> "12"
        "UvpForeignProjectDoc" -> "11"
        "UvpSpatialPlanningProcedureDoc" -> "13"
        "UvpLineDeterminationDoc" -> "14"
        else -> throw ServerException.withReason("Could not map document type: $type")
    }

    val parentUuid: String? = data._parent
    var pointOfContact: AddressModelTransformer? = null
    private var nonHiddenAncestorAddresses: MutableList<DocumentData>? = null

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

    private fun determinePointOfContact(): AddressModelTransformer? {
        val ref = data.pointOfContact
            ?.firstOrNull()
            ?.ref ?: return null

        val address = documentService?.getLastPublishedDocument(catalogId, ref)!!
        val codelistTransformer = CodelistTransformer(codelistHandler!!, catalogId)
        val addressTransformer =
            AddressModelTransformer(
                AddressTransformerConfig(
                    catalogId,
                    codelistTransformer,
                    null,
                    address,
                    documentService!!,
                    null,
                    emptyList(),
                ),
            )
        nonHiddenAncestorAddresses = addressTransformer.getAncestorAddressesIncludingSelf(address.wrapperId)

        return if (nonHiddenAncestorAddresses!!.size > 0) {
            val result = nonHiddenAncestorAddresses!!.last().document
            AddressModelTransformer(
                AddressTransformerConfig(
                    catalogId,
                    codelistTransformer,
                    null,
                    result,
                    documentService!!,
                    null,
                    emptyList(),
                ),
            )
        } else {
            null
        }
    }

    fun getSpatial(): String? = data.spatials
        ?.map { prepareSpatialString(it) }
        ?.getOrNull(0)

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

    private fun getSpatialBoundingBox(): SpatialModel.BoundingBoxModel? = data.spatials
        ?.getOrNull(0)
        ?.value

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
        return "$title: $coordinates"
    }

    val steps = data.steps

    fun getStepsAsPhases(): List<String> = steps
        .map {
            when (it) {
                is StepPublicDisclosure -> "phase1"
                is StepPublicHearing -> "phase2"
                is StepDecisionOfAdmission -> "phase3"
                else -> "???"
            }
        }

    fun getDecisionDate(): List<String> {
        val decisionDates =
            data.steps.filterIsInstance<StepDecisionOfAdmission>().map { it.decisionDate }.toMutableList()
        if (data.decisionDate != null) decisionDates += data.decisionDate

        return decisionDates
            .map { OffsetDateTime.parse(it) }
            .map { formatDate(formatterNoSeparator, it) }
    }

    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }

        val documentService: DocumentService? by lazy { SpringContext.getBean(DocumentService::class.java) }
    }

    fun getCodelistValue(codelistId: String, entry: KeyValue?): String {
        if (entry == null) return ""

        if (entry.key == null) return entry.value!!

        return codelistHandler?.getCodelistValue(codelistId, entry.key) ?: "???"
    }

    fun getUvpNumbers(): List<UVPNumber> = data.uvpNumbers

    fun getUvpCategories(): List<String> = getUvpNumbers().map { it.category }.filter { it.isNotEmpty() }

    fun getUvpCategoryTypes(): List<String> = getUvpNumbers().map { it.type }.filter { it.isNotEmpty() }

    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime) = formatter.format(Date.from(date.toInstant()))

    fun getPostBoxString(): String = "Postbox ${pointOfContact?.poBox}, ${pointOfContact?.zipPoBox ?: pointOfContact?.poBox} ${pointOfContact?.city}"

    fun hasPoBox(): Boolean = !pointOfContact?.poBox.isNullOrEmpty()

    fun getUvpAddressParents(): List<DocumentData> =
        if (pointOfContact!!.parentAddresses.isEmpty()) emptyList() else nonHiddenAncestorAddresses!!.dropLast(1)

    fun getUvpAddressParentsIncludingCurrent(): List<AddressShort> =
        if (pointOfContact == null) emptyList() else nonHiddenAncestorAddresses!!.map { getAddressShort(it.document) }

    fun getAddressShort(address: Document): AddressShort = if (address.data.getString("organization") == null) {
        AddressShort(address.uuid, getPersonStringFromJson(address))
    } else {
        AddressShort(address.uuid, address.data.getString("organization")!!)
    }

    private fun getPersonStringFromJson(address: Document): String = listOfNotNull(
        getCodelistValue(
            "4300",
            address.data.get("salutation")?.mapToKeyValue(),
        ),
        getCodelistValue(
            "4305",
            address.data.get("academic-title")?.mapToKeyValue(),
        ),
        address.data.getString("firstName"),
        address.data.getString("lastName"),
    ).filter { it.isNotEmpty() }.joinToString(" ")
}

data class AddressShort(val uuid: String, val title: String)
