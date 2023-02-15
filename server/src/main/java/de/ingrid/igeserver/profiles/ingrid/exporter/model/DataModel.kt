package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val parentIdentifier: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    val modifiedMetadata: OffsetDateTime?,
    val pointOfContact: List<AddressRefModel>?,
    val spatial: IngridSpatial,
    val metadata: IngridMetadata,
    val advProductGroups: List<KeyValueModel>?,
    val alternateTitle: String?,
    val themes: List<KeyValueModel>?,
    val keywords: List<String>?,
    val dataset: Dataset?,
    val isAdVCompatible: Boolean?,
    val isOpenData: Boolean?,
    val isInspireRelevant: Boolean?,
    val openDataCategories: List<KeyValueModel>?,
    val temporal: Temporal,
    val resource: Resource?,
    val maintenanceInformation: MaintenanceInformation?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Dataset(
    val languages: List<String>?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Resource(
    val purpose: String?,
    val specificUsage: String?,
)


@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridMetadata(
    val language: KeyValueModel,
    val characterSet: KeyValueModel?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridSpatial(
    val references: List<SpatialModel>?,
    val spatialSystems: List<KeyValueModel>?,
    val verticalExtent: VerticalExtent?,
    val description: String?,
    val regionKey: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Temporal(
    val events: List<DateEvent>?,
    val status: KeyValueModel?,
    val resourceDateType: KeyValueModel?,
    val resourceDateTypeSince: KeyValueModel?,
    @JsonDeserialize(using = DateDeserializer::class)
    val resourceDate: OffsetDateTime?,
    val resourceRange: TimeRange?,
    val timeRefStatus: KeyValueModel?,
    val maintenanceNote: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MaintenanceInformation(
    val maintenanceAndUpdateFrequency: KeyValueModel?,
    val userDefinedMaintenanceFrequency: UserDefinedMaintenanceFrequency?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UserDefinedMaintenanceFrequency(
    val number: Int?,
    val unit: KeyValueModel?
)


data class DateEvent(
    @JsonDeserialize(using = DateDeserializer::class)
    val referenceDate: OffsetDateTime,
    val referenceDateType: KeyValueModel
)


data class TimeRange(
    @JsonDeserialize(using = DateDeserializer::class)
    val start: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val end: OffsetDateTime
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class VerticalExtent(
    val Datum: KeyValueModel?,
    val minimumValue: Float?,
    val maximumValue: Float?,
    val unitOfMeasure: KeyValueModel?,
)
