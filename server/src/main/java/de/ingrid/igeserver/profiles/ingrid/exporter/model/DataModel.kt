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
package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import java.text.ParseException
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    // TODO AW: remove parent from data
    @Deprecated("parent should not be in data, but as separate metadata") val _parent: String?,
    val parentIdentifier: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    val modifiedMetadata: OffsetDateTime?,
    val pointOfContact: List<AddressRefModel>?,
    val spatial: IngridSpatial = IngridSpatial(null ,null, null, null),
    val vectorSpatialRepresentation: List<VectorSpatialRepresentation>?,
    val explanation: String?,
    val publication: Publication?,
    val methodText: String?,
    val baseDataText: String?,
    val manager: String?,
    val participants: String?,
    val implementationHistory: String?,
    val systemEnvironment: String?,
    val metadata: IngridMetadata?,
    val advProductGroups: List<KeyValue>?,
    val alternateTitle: String?,
    val themes: List<KeyValue>?,
    val keywords: Keywords?,
    val dataset: Dataset?,
    val isAdVCompatible: Boolean?,
    val isOpenData: Boolean?,
    val isInspireIdentified: Boolean?,
    val openDataCategories: List<KeyValue>?,
    val priorityDatasets: List<KeyValue>?,
    val invekosKeywords: List<KeyValue>?,
    val hvdCategories: List<KeyValue>?,
    val temporal: Temporal = Temporal(),
    val resource: Resource?,
    val extraInfo: ExtraInfo?,
    val maintenanceInformation: MaintenanceInformation?,
    val gridSpatialRepresentation: GridSpatialRepresentation?,
    val identifier: String?,
    val graphicOverviews: List<GraphicOverview>?,
    val spatialRepresentationType: List<KeyValue>?,
    val resolution: List<Resolution>?,
    val topicCategories: List<KeyValue>?,
    val portrayalCatalogueInfo: PortrayalCatalogueInfo?,
    val featureCatalogueDescription: FeatureCatalogueDescription?,
//    val digitalTransferOptions: List<DigitalTransferOption>?,
    val categoryCatalog: List<CategoryCatalog>?,
    val databaseContent: List<DatabaseContent>?,
    val distribution: Distribution?,
    var orderInfo: String?,
    val fees: String?,
    var references: List<Reference>?,
    var fileReferences: List<FileReference>?,
    val serviceUrls: List<ServiceUrl>?,
    val dataQuality: DataQuality?,
    val dataQualityInfo: DataQualityInfo?,
    val qualities: List<Quality>?,
    val absoluteExternalPositionalAccuracy: AbsoluteExternalPositionalAccuracy?,
    val conformanceResult: List<ConformanceResult>?,
    val lineage: Lineage?,
    val service: Service = Service(),
    val spatialScope: KeyValue?,
    val subType: KeyValue?,
)


data class VectorSpatialRepresentation(
    val topologyLevel: KeyValue?,
    val geometricObjectType: KeyValue?,
    val geometricObjectCount: Int?,
)

data class Publication(
    val isbn: String?,
    val pages: String?,
    val author: String?,
    val volume: String?,
    val location: String?,
    val publisher: String?,
    val explanation: String?,
    val publishedIn: String?,
    val baseDataText: String?,
    val documentType: KeyValue?,
    val publicationDate: String?,
    val publishingHouse: String?,
    val bibliographicData: String?,
    val placeOfPublication: String?,
) {
    fun hasSeriesInfo(): Boolean = listOfNotNull(
        publishedIn,
        volume,
        pages,
    ).any { it.isNotEmpty() }


}


data class DatabaseContent(
    val parameter: String?,
    val moreInfo: String?,
)

data class CategoryCatalog(
    val title: KeyValue?,
    @JsonDeserialize(using = DateDeserializer::class)
    val date: OffsetDateTime?,
    val edition: String?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Service(
    val classification: List<KeyValue>? = null,
    val type: KeyValue? = null,
    val version: List<KeyValue>? = null,
    val operations: List<Operation>? = null,
    val resolution: List<Resolution>? = null,
    val systemEnvironment: String? = null,
    val implementationHistory: String? = null,
    val explanation: String? = null,
    val coupledResources: List<CoupledResource>? = null,
    val couplingType: KeyValue? = null,
    val hasAccessConstraints: Boolean? = false,
    val isAtomDownload: Boolean? = null
) {
    fun hasAccessConstraintsOrFalse() : Boolean {
        return hasAccessConstraints ?: false
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class Reference(
    val title: String,
    var type: KeyValue,
    val explanation: String?,
    val url: String?,
    val uuidRef: String?,
    val urlDataType: KeyValue?,
    var uuidRefClass: String? = null,
    var uuidRefVersion: String? = null,
    var uuidRefServiceType: KeyValue? = null
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FileReference(
    val link: FileName,
    val title: String?,
    val description: String?,
    val format: FileFormat?,
    var url: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FileFormat(
    val key: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CoupledResource(
    val title: String?,
    val url: String?,
    val identifier: String?,
    val uuid: String?,
    val layerNames: List<String>?,
    val isExternalRef: Boolean
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ServiceUrl(
    val name: String,
    val url: String,
    val description: String?,
    var attachedToField: AttachedField? = null,
    var applicationProfile: String? = null,
    var functionValue: String? = null,
    val isIdfResource: Boolean = true
)

data class AttachedField(
    val listId: String,
    val entryId: String,
    val text: String
)

data class Operation(
    val name: KeyValue?,
    val description: String?,
    val methodCall: String?,
)

data class Lineage(
    val statement: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class PortrayalCatalogueInfo(
    val citation: List<Citation>?,
)


@JsonIgnoreProperties(ignoreUnknown = true)
data class DataQualityInfo(
    val lineage: DataQualityLineage?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataQualityLineage(
    val source: DataQualityLineageSource?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataQualityLineageSource(
    val descriptions: List<KeyValue>?,
    val processStep: ProcessStep?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ProcessStep(
    val description: List<KeyValue>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ConformanceResult(
    val pass: KeyValue,
    val isInspire: Boolean?,
    val specification: KeyValue?,
) {
    val explanation: String? = null
        get() {
            return if (field.isNullOrEmpty()) "see the referenced specification" else field
        }

    val publicationDate: String? = null
        get() {
            return if (field?.contains("Z") == true) {
                val isoDate: Date = try {
                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX").parse(field)
                } catch (ex: ParseException) {
                    Date.from(OffsetDateTime.parse(field).toInstant())
                }
                SimpleDateFormat("yyyy-MM-dd").format(isoDate)
            } else field
        }
}


@JsonIgnoreProperties(ignoreUnknown = true)
data class AbsoluteExternalPositionalAccuracy(
    val vertical: Number?,
    val horizontal: Number?,
    val griddedDataPositionalAccuracy: Number?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataQuality(
    val completenessOmission: CompletenessOmission?,
)

data class CompletenessOmission(
    val measResult: Number?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Quality(
    val _type: String,
    val measureType: KeyValue?,
    val value: Number,
    val parameter: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Distribution(
    val format: List<DistributionFormat>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DistributionFormat(
    val name: KeyValue?,
    val version: String?,
    val compression: String?,
    val specification: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FeatureCatalogueDescription(
    val citation: List<Citation>?,
    val featureTypes: List<KeyValue>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Citation(
    val title: KeyValue?,
    @JsonDeserialize(using = DateDeserializer::class)
    val date: OffsetDateTime?,
    val edition: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GraphicOverview(
    val fileName: FileName,
    val fileDescription: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FileName(
    val asLink: Boolean,
    val value: String,
    val uri: String,
    val sizeInBytes: Number?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Resolution(
    val denominator: Int?,
    val distanceMeter: Number?,
    val distanceDPI: Number?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GridSpatialRepresentation(
    val type: KeyValue?,
    val axesDimensionProperties: List<AxisDimensionProperties>,
    val transformationParameterAvailability: Boolean = false,
    val numberOfDimensions: Int?,
    val cellGeometry: KeyValue?,
    val georectified: Georectified?,
    val georeferenceable: Georeferenceable?,
)

data class Georectified(
    val checkPointAvailability: Boolean? = false,
    val checkPointDescription: String?,
    val cornerPoints: String?,
    val pointInPixel: KeyValue?,//2100
)

data class Georeferenceable(
    val orientationParameterAvailability: Boolean? = false,
    val controlPointAvaliability: Boolean? = false,
    val parameters: String?,
)




@JsonIgnoreProperties(ignoreUnknown = true)
data class AxisDimensionProperties(
    val name: KeyValue,
    val size: Int?,
    val resolution: Double?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Dataset(
    val languages: List<String>?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Resource(
    val purpose: String?,
    val specificUsage: String?,
    val useLimitation: String?,
    val useConstraints: List<UseConstraint>?,
    val accessConstraints: List<KeyValue>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UseConstraint(
    var title: KeyValue?,
    val source: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ExtraInfo(
    val legalBasicsDescriptions: List<KeyValue>?,
)


@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridMetadata(
    val language: KeyValue,
    val characterSet: KeyValue?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridSpatial(
    val references: List<SpatialModel>?,
    val spatialSystems: List<KeyValue>?,
    val verticalExtent: VerticalExtent?,
    val description: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Temporal(
    val events: List<DateEvent>? = null,
    val status: KeyValue? = null,
    val resourceDateType: KeyValue? = null,
    val resourceDateTypeSince: KeyValue? = null,
    @JsonDeserialize(using = DateDeserializer::class)
    val resourceDate: OffsetDateTime? = null,
    val resourceRange: TimeRange? = null,
    val timeRefStatus: KeyValue? = null,
    val maintenanceNote: String? = null,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class MaintenanceInformation(
    val maintenanceAndUpdateFrequency: KeyValue?,
    val userDefinedMaintenanceFrequency: UserDefinedMaintenanceFrequency?,
    val description: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UserDefinedMaintenanceFrequency(
    val number: Int?,
    val unit: KeyValue?
)

data class DateEvent(
    @JsonDeserialize(using = DateDeserializer::class)
    val referenceDate: OffsetDateTime,
    val referenceDateType: KeyValue
)


data class TimeRange(
    @JsonDeserialize(using = DateDeserializer::class)
    val start: OffsetDateTime?,
    @JsonDeserialize(using = DateDeserializer::class)
    val end: OffsetDateTime?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class VerticalExtent(
    val Datum: KeyValue?,
    val minimumValue: Float?,
    val maximumValue: Float?,
    val unitOfMeasure: KeyValue?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Keywords(
    val free: List<Keyword>?,
    val umthes: List<Keyword>?,
    val gemet: List<Keyword>?,
)

data class Keyword(
    val id: String?,
    val label: String,
    val alternativeLabel: String?
)
