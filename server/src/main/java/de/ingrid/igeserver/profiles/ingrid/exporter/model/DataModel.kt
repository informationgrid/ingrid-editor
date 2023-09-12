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
    val explanation: String?,
    val publication: Publication?,
    val methodText: String?,
    val baseDataText: String?,
    val manager: String?,
    val participants: String?,
    val implementationHistory: String?,
    val systemEnvironment: String?,
    val metadata: IngridMetadata,
    val advProductGroups: List<KeyValueModel>?,
    val alternateTitle: String?,
    val themes: List<KeyValueModel>?,
    val keywords: Keywords?,
    val dataset: Dataset?,
    val isAdVCompatible: Boolean?,
    val isOpenData: Boolean?,
    val isInspireIdentified: Boolean?,
    val openDataCategories: List<KeyValueModel>?,
    val priorityDatasets: List<KeyValueModel>?,
    val temporal: Temporal,
    val resource: Resource?,
    val extraInfo: ExtraInfo?,
    val maintenanceInformation: MaintenanceInformation?,
    val gridSpatialRepresentation: GridSpatialRepresentation?,
    val identifier: String?,
    val graphicOverviews: List<GraphicOverview>?,
    val spatialRepresentationType: List<KeyValueModel>?,
    val resolution: List<Resolution>?,
    val topicCategories: List<KeyValueModel>?,
    val portrayalCatalogueInfo: PortrayalCatalogueInfo?,
    val featureCatalogueDescription: FeatureCatalogueDescription?,
    val digitalTransferOptions: List<DigitalTransferOption>?,
    val categoryCatalog: List<CategoryCatalog>?,
    val databaseContent: List<DatabaseContent>?,
    val distribution: Distribution?,
    val orderInfo: String?,
    val references: List<Reference>?,
    val serviceUrls: List<ServiceUrl>?,
    val dataQuality: DataQuality?,
    val dataQualityInfo: DataQualityInfo?,
    val qualities: List<Quality>?,
    val absoluteExternalPositionalAccuracy: AbsoluteExternalPositionalAccuracy?,
    val conformanceResult: List<ConformanceResult>?,
    val lineage: Lineage?,
    val service: Service?,
    val spatialScope: KeyValueModel?,
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
    val documentType: KeyValueModel?,
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
    val title: KeyValueModel?,
    @JsonDeserialize(using = DateDeserializer::class)
    val date: OffsetDateTime?,
    val edition: String?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Service(
    val classification: List<KeyValueModel>?,
    val type: KeyValueModel?,
    val version: List<KeyValueModel>?,
    val operations: List<Operation>?,
    val resolution: List<Resolution>?,
    val systemEnvironment: String?,
    val implementationHistory: String?,
    val explanation: String?,
    val coupledResources: List<CoupledResource>?,
    val couplingType: KeyValueModel?,
    val hasAccessConstraints: Boolean?,
    val isAtomDownload: Boolean?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Reference(
    val title: String,
    val type: KeyValueModel,
    val explanation: String?,
    val url: String?,
    val uuidRef: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class CoupledResource(
    val title: String?,
    val url: String?,
    val identifier: String?,
    val uuid: String,
    val isExternalRef: Boolean
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ServiceUrl(
    val name: String,
    val url: String,
    val description: String?,
)

data class Operation(
    val name: KeyValueModel?,
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
    val descriptions: List<KeyValueModel>?,
    val processStep: ProcessStep?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ProcessStep(
    val description: List<KeyValueModel>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ConformanceResult(
    val pass: KeyValueModel,
    val isInspire: Boolean?,
    val specification: KeyValueModel?,
    val publicationDate: String,
) {
    val explanation: String? = null
        get() {
            return if (field.isNullOrEmpty()) "see the referenced specification" else field
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
    val measureType: KeyValueModel?,
    val value: Number,
    val parameter: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Distribution(
    val format: List<DistributionFormat>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DistributionFormat(
    val name: KeyValueModel?,
    val version: String?,
    val compression: String?,
    val specification: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class DigitalTransferOption(
    val name: KeyValueModel?,
    val transferSize: Number?,
    val mediumNote: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class FeatureCatalogueDescription(
    val citation: List<Citation>?,
    val featureTypes: List<KeyValueModel>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Citation(
    val title: KeyValueModel?,
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
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Resolution(
    val denominator: Int?,
    val distanceMeter: Number?,
    val distanceDPI: Number?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class GridSpatialRepresentation(
    val type: KeyValueModel,
    val axesDimensionProperties: List<AxisDimensionProperties>,
    val transformationParameterAvailability: Boolean,
    val numberOfDimensions: Int?,
    val cellGeometry: KeyValueModel?,
    val georectified: Georectified?,
    val georeferenceable: Georeferenceable?,
)

data class Georectified(
    val checkPointAvailability: Boolean?,
    val checkPointDescription: String?,
    val cornerPoints: String?,
    val pointInPixel: KeyValueModel?,//2100
)

data class Georeferenceable(
    val orientationParameterAvailability: Boolean?,
    val controlPointAvaliability: Boolean?,
    val parameters: String?,
)




@JsonIgnoreProperties(ignoreUnknown = true)
data class AxisDimensionProperties(
    val name: KeyValueModel,
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
    val accessConstraints: List<KeyValueModel>?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class UseConstraint(
    var title: KeyValueModel?,
    val source: String?,
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class ExtraInfo(
    val legalBasicsDescriptions: List<KeyValueModel>?,
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
    val description: String?,
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
    val start: OffsetDateTime?,
    @JsonDeserialize(using = DateDeserializer::class)
    val end: OffsetDateTime?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class VerticalExtent(
    val Datum: KeyValueModel?,
    val minimumValue: Float?,
    val maximumValue: Float?,
    val unitOfMeasure: KeyValueModel?,
)

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
