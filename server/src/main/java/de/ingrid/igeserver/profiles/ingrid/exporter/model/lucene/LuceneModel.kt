/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonRawValue

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDocument(
    val id: String?,
    @JsonProperty("\$schema")
    val schema: String = "https://schema.ingrid-oss.eu/index/draft/index-ingrid.html",
    val metadata: LuceneMetadata,
    val title: String?,
    val description: String?,
    val spatials: List<LuceneSpatial> = emptyList(),
    val temporal: LuceneTemporal,
    val keywords: List<LuceneKeyword> = emptyList(),
    val references: List<LuceneReference> = emptyList(),
    @JsonProperty("sort_uuid")
    val sortUuid: String = "",
    val contacts: List<LuceneContact> = emptyList(),
    val exports: Map<String, Any?> = emptyMap(),
    val ingrid: LuceneIngrid,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneMetadata(
    @JsonProperty("data_type")
    val dataType: String = "INGRID",
    val created: String?,
    val modified: String?,
    val issued: String? = null,
    @JsonProperty("document_type")
    val documentType: String? = null,
    val partner: String?,
    val provider: String?,
    val language: String?,
    val datasource: LuceneDatasource?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDatasource(
    val id: String?,
    val name: String?,
    val type: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneSpatial(
    val name: String? = null,
    val bbox: List<Double>? = null,
    val wkt: String? = null,
    val toponym: List<String>? = null,
    val administrative: LuceneAdministrative? = null,
    /**
     * Supports raw GeoJSON string without re-escaping or double serialization.
     */
    @JsonRawValue
    val geometry: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneAdministrative(
    @JsonProperty("regional_key")
    val regionalKey: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneTemporal(
    @JsonProperty("data_temporal")
    val dataTemporal: List<LuceneDataTemporal> = emptyList(),
    val status: LuceneKeyValue? = null,
    @JsonProperty("maintenance_frequency")
    val maintenanceFrequency: LuceneKeyValue? = null,
    @JsonProperty("user_defined_maintenance_frequency_in_sec")
    val userDefinedMaintenanceFrequencyInSec: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDataTemporal(
    @JsonProperty("date_type")
    val dateType: String,
    val date: String? = null,
    @JsonProperty("date_text")
    val dateText: String? = null,
    @JsonProperty("date_range")
    val dateRange: LuceneDateRange? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDateRange(
    val start: String?,
    val end: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneKeyword(
    val term: String?,
    val id: String?,
    val source: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneContact(
    val role: String? = null,
    val name: String? = null,
    val communications: List<LuceneCommunication> = emptyList(),
    val street: String? = null,
    val code: String? = null,
    val pocode: String? = null,
    val locality: String? = null,
    val country: String? = null,
    @JsonProperty("administrative_area")
    val administrativeArea: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneCommunication(
    val type: String?,
    val value: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneKeyValue(
    val key: String?,
    val value: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneIngrid(
    @JsonProperty("alternate_title")
    val alternateTitle: String? = null,
    val licenses: List<LuceneLicense> = emptyList(),
    @JsonProperty("parent_identifier")
    val parentIdentifier: String? = null,
    @JsonProperty("datasource_identifier")
    val datasourceIdentifier: String? = null,
    @JsonProperty("spatial_representation")
    val spatialRepresentation: SpatialRepresentation? = null,
    @JsonProperty("specific_usage")
    val specificUsage: String? = null,
    val purpose: String? = null,
    @JsonProperty("conformance_result")
    val conformanceResult: List<LuceneConformanceResult> = emptyList(),
    @JsonProperty("order_info")
    val orderInfo: String? = null,
    @JsonProperty("data_quality")
    val dataQuality: LuceneDataQuality? = null,
    @JsonProperty("spatial_resolution_scale")
    val spatialResolutionScale: LuceneSpatialResolutionScale? = null,
    @JsonProperty("cross_references")
    val crossReferences: List<LuceneCrossReference> = emptyList(),
    val lineage: LuceneLineage? = null,
    @JsonProperty("process_step_description")
    val processStepDescription: List<String> = emptyList(),
    @JsonProperty("symbol_catalogue")
    val symbolCatalogue: List<LuceneCatalogueReference> = emptyList(),
    @JsonProperty("codelist_reference")
    val codelistReference: List<LuceneCatalogueReference> = emptyList(),
    @JsonProperty("attribute_description")
    val attributeDescription: List<String> = emptyList(),
    val spatial: LuceneIngridSpatial? = null,
    @JsonProperty("character_set")
    val characterSet: LuceneKeyValue? = null,
    val service: LuceneService? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneSpatialResolutionScale(
    val scale: Int? = null,
    @JsonProperty("resolution_ground")
    val resolutionGround: Double? = null,
    @JsonProperty("resolution_scan")
    val resolutionScan: Double? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneCrossReference(
    val uuid: String? = null,
    val name: String? = null,
    @JsonProperty("document_type")
    val documentType: String? = null,
    val description: String? = null,
    @JsonProperty("reference_type")
    val referenceType: String? = null,
    val direction: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneLineage(
    val statement: String? = null,
    val source: String? = null,
    @JsonProperty("process_step")
    val processStep: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneCatalogueReference(
    val title: String? = null,
    val date: String? = null,
    val version: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneIngridSpatial(
    val description: String? = null,
    @JsonProperty("vertical_extent")
    val verticalExtent: LuceneVerticalExtent? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneVerticalExtent(
    val minimum: Double? = null,
    val maximum: Double? = null,
    val unit: LuceneKeyValue? = null,
    val vdatum: LuceneKeyValue? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDataQuality(
    @JsonProperty("completeness_omission")
    val completenessOmission: Double? = null,
    @JsonProperty("positional_accuracy")
    val positionalAccuracy: LucenePositionalAccuracy? = null,
    val qualities: List<LuceneQuality> = emptyList(),
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LucenePositionalAccuracy(
    val horizontal: Double? = null,
    val vertical: Double? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneQuality(
    val type: String? = null,
    @JsonProperty("measure_type")
    val measureType: LuceneKeyValue? = null,
    val value: Double? = null,
    val parameter: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneService(
    val type: String? = null,
    val classifications: List<String> = emptyList(),
    val versions: List<String> = emptyList(),
    val operations: List<LuceneServiceOperation> = emptyList(),
    @JsonProperty("environment_description")
    val environmentDescription: String? = null,
    @JsonProperty("service_history")
    val serviceHistory: String? = null,
    @JsonProperty("additional_information")
    val additionalInformation: String? = null,
    @JsonProperty("has_access_constraints")
    val hasAccessConstraints: Boolean? = null,
    val doi: LuceneDoi? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneServiceOperation(
    val name: String? = null,
    val description: String? = null,
    @JsonProperty("access_url")
    val accessUrl: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneDoi(
    val identifier: String? = null,
    @JsonProperty("general_resource_type")
    val generalResourceType: String? = null,
    @JsonProperty("resource_type")
    val resourceType: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentation(
    val types: List<SpatialRepresentationType>,
    val vector: List<SpatialRepresentationVector> = emptyList(),
    val grid: SpatialRepresentationGrid? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentationGrid(
    val axes: List<SpatialRepresentationAxis> = emptyList(),
    @JsonProperty("available_parameters")
    val availableParameters: Boolean = false,
    @JsonProperty("number_dimensions")
    val numberDimensions: Int? = null,
    @JsonProperty("cell_geometry")
    val cellGeometry: LuceneKeyValue? = null,
    val rectified: SpatialRepresentationGridRectified? = null,
    val referenced: SpatialRepresentationGridReferenced? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentationGridRectified(
    val checkPointAvailability: Boolean,
    val checkPointDescription: String?,
    val cornerPoints: String?,
    val pointInPixel: LuceneKeyValue?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentationGridReferenced(
    val orientationParameterAvailability: Boolean,
    val controlPointAvaliability: Boolean,
    val parameters: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentationAxis(
    val label: String? = null,
    val number: Int? = null,
    val resolution: Double? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class SpatialRepresentationVector(
    val topology: String? = null,
    @JsonProperty("geometry_type")
    val geometryType: String? = null,
    val number: Int? = null,
)

enum class SpatialRepresentationType {
    @JsonProperty("text")
    TEXT,

    @JsonProperty("vector")
    VECTOR,

    @JsonProperty("tin")
    TIN,

    @JsonProperty("video")
    VIDEO,

    @JsonProperty("stereomodel")
    STEREOMODEL,

    @JsonProperty("grid")
    GRID,
}

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneReference(
    val internal: Boolean = false,
    val url: String? = null,
    @JsonProperty("uuid_ref")
    val uuidRef: String? = null,
    val type: LuceneKeyValue? = null,
    val title: String? = null,
    val explanation: String? = null,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneLicense(
    val type: String?,
    val items: List<LuceneLicenseItem> = emptyList(),
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneLicenseItem(
    val key: String?,
    val value: String?,
    val source: String?,
)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class LuceneConformanceResult(
    val pass: String?,
    val specification: LuceneKeyValue?,
    val publicationDate: String?,
    val explanation: String?,
)
