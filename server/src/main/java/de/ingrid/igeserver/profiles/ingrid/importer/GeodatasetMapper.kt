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
package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.*
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.iso639LanguageMapping
import org.apache.logging.log4j.kotlin.logger

open class GeodatasetMapper(isoData: IsoImportData) : GeneralMapper(isoData) {

    val log = logger()
    val identificationInfo = metadata.identificationInfo[0].dataIdentificationInfo

    fun getTopicCategories(): List<KeyValue> {
        return identificationInfo?.topicCategory
            ?.mapNotNull { it.value }
            ?.mapNotNull { codeListService.getCodeListEntryId("527", it, "iso") }
            ?.map { KeyValue(it) } ?: emptyList()

    }

    fun getCharacterSet(): KeyValue? {
        val value = identificationInfo?.characterSet?.get(0)?.code?.codeListValue
        val entryId = codeListService.getCodeListEntryId("510", value, "iso")
        if (entryId == null) {
            log.warn("Could not map CharacterSet: $value")
            return null
        }

        return KeyValue(entryId)
    }

    fun getLanguages(): List<String> {
        return identificationInfo?.language
            ?.mapNotNull { it.code?.codeListValue }
            ?.map {
                iso639LanguageMapping[it]
                    ?: throw ServerException.withReason("Could not map document language key: $it")
            }
            ?: emptyList()
    }

    fun getFeatureTypes(): List<KeyValue> {
        return metadata.contentInfo
            ?.flatMap {
                it.mdFeatureCatalogueDescription?.featureTypes
                    ?.mapNotNull { it.value } ?: emptyList()
            }
            ?.map { KeyValue(null, it) } ?: emptyList()
    }

    fun getSourceDescriptions(): List<KeyValue> {
        return metadata.dataQualityInfo
            ?.flatMap { dqi ->
                dqi.dqDataQuality?.lineage?.liLinage?.source
                    ?.map { it.liSource?.description?.value } ?: emptyList()
            }
            ?.map { KeyValue(null, it) } ?: emptyList()
    }

    fun getProcessStep(): List<KeyValue> {
        return metadata.dataQualityInfo
            ?.flatMap { dqi ->
                dqi.dqDataQuality?.lineage?.liLinage?.processStep
                    ?.mapNotNull { it.liProcessStep.description.value } ?: emptyList()
            }
            ?.map { KeyValue(null, it) } ?: emptyList()
    }

    fun getCompletenessOmissionValue(): Number? {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.report
                    ?.mapNotNull { it.dqCompletenessOmission?.result?.dqQuantitativeResult?.value?.get(0)?.value }
                    ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toDouble()
    }

    fun getQualities(): List<Quality> {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report ?: emptyList() }
            ?.mapNotNull { mapQuality(it) } ?: emptyList()
    }

    fun getVectorSpatialRepresentation(): List<VectorSpatialRepresentation> {
        return metadata.spatialRepresentationInfo
            ?.mapNotNull { it.mdVectorSpatialRepresentation }
            ?.map { mapVectorSpatialRepreseantation(it) } ?: emptyList()
    }

    private fun mapVectorSpatialRepreseantation(vector: MDVectorSpatialRepresentation): VectorSpatialRepresentation {
        val topologyLevelValue = vector.topologyLevel?.value?.codeListValue
        val entryIdTopologyLevel = codeListService.getCodeListEntryId("528", topologyLevelValue, "iso")
        val objectTypeValue = vector.geometricObjects?.get(0)?.value?.geometricObjectType?.value?.codeListValue
        val entryIdObjectType = codeListService.getCodeListEntryId("515", objectTypeValue, "iso")
        val objectCount = vector.geometricObjects?.get(0)?.value?.geometricObjectCount?.value

        return VectorSpatialRepresentation(KeyValue(entryIdTopologyLevel), KeyValue(entryIdObjectType), objectCount)
    }

    fun getGridSpatialRepresentation(): GridSpatialRepresentation? {
        val isGeneral = metadata.spatialRepresentationInfo?.filter { it.mdGridSpatialRepresentation != null }
        val isGeoReferenced = metadata.spatialRepresentationInfo?.filter { it.mdGeoreferenceable != null }
        val isGeoRectified = metadata.spatialRepresentationInfo?.filter { it.mdGeorectified != null }

        return if (!isGeoReferenced.isNullOrEmpty()) mapGeoReferencedRepresentation(isGeoReferenced[0].mdGeoreferenceable!!)
        else if (!isGeoRectified.isNullOrEmpty()) mapGeoRectifiedRepresentation(isGeoRectified[0].mdGeorectified!!)
        else if (!isGeneral.isNullOrEmpty()) mapGeneralRepresentation(isGeneral[0].mdGridSpatialRepresentation!!)
        else null
    }

    private fun mapGeneralRepresentation(node: MDGridSpatialRepresentation): GridSpatialRepresentation {
        return GridSpatialRepresentation(
            KeyValue("basis"),
            getAxesDimProperties(node.axisDimensionProperties),
            node.transformationParameterAvailability.boolean?.value ?: false,
            node.numberOfDimensions.value ?: 0,
            getCellGeometryId(node.cellGeometry),
            null,
            null,
            null,
            null,
            null,
            null,
            null
        )
    }

    private fun mapGeoRectifiedRepresentation(node: MDGeorectified): GridSpatialRepresentation {
        val pointValue = node.pointInPixel.mdPixelOrientationCode
        val pointId = codeListService.getCodeListEntryId("2100", pointValue, "iso")
        return GridSpatialRepresentation(
            KeyValue("rectified"),
            getAxesDimProperties(node.axisDimensionProperties),
            node.transformationParameterAvailability.boolean?.value ?: false,
            node.numberOfDimensions.value ?: 0,
            getCellGeometryId(node.cellGeometry),
            node.checkPointAvailability?.boolean?.value ?: false,
            node.checkPointDescription?.value,
            node.cornerPoints[0].point.coordinates ?: "",
            KeyValue(pointId),
            null,
            null,
            null
        )
    }

    private fun mapGeoReferencedRepresentation(node: MDGeoreferenceable): GridSpatialRepresentation {
        return GridSpatialRepresentation(
            KeyValue("referenced"),
            getAxesDimProperties(node.axisDimensionProperties),
            node.transformationParameterAvailability.boolean?.value ?: false,
            node.numberOfDimensions.value ?: 0,
            getCellGeometryId(node.cellGeometry),
            null,
            null,
            null,
            null,
            node.controlPointAvailability.boolean?.value ?: false,
            node.orientationParameterAvailability.boolean?.value ?: false,
            node.georeferencedParameters.value?.value
        )
    }

    private fun getCellGeometryId(cellGeometry: CellGeometry): KeyValue {
        val cellGeometryId =
            codeListService.getCodeListEntryId("509", cellGeometry.mdCellGeometryCode?.codeListValue, "iso")
        return KeyValue(cellGeometryId)
    }

    private fun getAxesDimProperties(properties: List<AxisDimensionProperty>): List<AxesDimProperty> {
        return properties.map {
            val nameValue = it.mdDimension?.dimensionName?.mdDimensionNameTypeCode?.codeListValue
            val nameId = codeListService.getCodeListEntryId("514", nameValue, "iso")
            AxesDimProperty(
                KeyValue(nameId),
                it.mdDimension?.dimensionSize?.value ?: 0,
                it.mdDimension?.resolution?.scale?.value ?: 0f
            )
        }
    }

    data class GridSpatialRepresentation(
        val type: KeyValue?,
        val axesDimensionProperties: List<AxesDimProperty>,
        val transformationParameterAvailability: Boolean,
        val numberOfDimensions: Int?,
        val cellGeometry: KeyValue?,
        val checkPointAvailability: Boolean?,
        val checkPointDescription: String?,
        val cornerPoints: String?,
        val pointInPixel: KeyValue?,
        val controlPointAvailability: Boolean?,
        val orientationParameterAvailability: Boolean?,
        val geoRefParameters: String?
    )

    data class AxesDimProperty(
        val name: KeyValue?,
        val size: Int?,
        val resolution: Float,
    )

    fun getSubtype(): KeyValue? {
        val value = metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue ?: return null
        return codeListService.getCodeListEntryId("525", value, "iso")
            ?.let { KeyValue(it) }
    }

    private fun mapQuality(report: DQReport): Quality? {
        val info =
            // if (report.dqTemporalValidity != null) QualityInfo("temporalValidity", "", report.dqTemporalValidity)
            if (report.dqTemporalConsistency != null) QualityInfo(
                "temporalConsistency",
                "7120",
                report.dqTemporalConsistency
            )
//            else if (report.dqAccuracyOfATimeMeasurement != null) QualityInfo("", ", (report.)
            else if (report.dqQuantitativeAttributeAccuracy != null) QualityInfo(
                "quantitativeAttributeAccuracy",
                "7127",
                report.dqQuantitativeAttributeAccuracy
            )
            else if (report.dqNonQuantitativeAttributeAccuracy != null) QualityInfo(
                "nonQuantitativeAttributeAccuracy",
                "7126",
                report.dqNonQuantitativeAttributeAccuracy
            )
            else if (report.dqThematicClassificationCorrectness != null) QualityInfo(
                "thematicClassificationCorrectness",
                "7125",
                report.dqThematicClassificationCorrectness
            )
            else if (report.dqRelativeInternalPositionalAccuracy != null) QualityInfo(
                "relativeInternalPositionalAccuracy",
                "7128",
                report.dqRelativeInternalPositionalAccuracy
            )
//            else if (report.dqGriddedDataPositionalAccuracy != null) QualityInfo("", ", (report.)
//            else if (report.dqAbsoluteExternalPositionalAccuracy != null) QualityInfo("", ", (report.)
            else if (report.dqTopologicalConsistency != null) QualityInfo(
                "topologicalConsistency",
                "7115",
                report.dqTopologicalConsistency
            )
            else if (report.dqFormatConsistency != null) QualityInfo(
                "formatConsistency",
                "7114",
                report.dqFormatConsistency
            )
            else if (report.dqDomainConsistency != null) QualityInfo(
                "domainConsistency",
                "7113",
                report.dqDomainConsistency
            )
            else if (report.dqConceptualConsistency != null) QualityInfo(
                "conceptualConsistency",
                "7112",
                report.dqConceptualConsistency
            )
//            else if (report.dqCompletenessOmission != null) QualityInfo("", ", (report.)
            else if (report.dqCompletenessCommission != null) QualityInfo(
                "completenessComission",
                "7109",
                report.dqCompletenessCommission
            )
            else return null

        if (info.element.nameOfMeasure == null) return null

        val name = info.element.nameOfMeasure.map { it.value }.joinToString(";")
        val nameId = codeListService.getCodeListEntryId(info.codelist, name, "de")
        val nameKeyValue = if (nameId == null) KeyValue(null, name) else KeyValue(nameId)
        val parameter = info.element.measureDescription?.value
        val value = info.element.result?.dqQuantitativeResult?.value?.getOrNull(0)?.value?.toDouble()
        return Quality(info.type, nameKeyValue, value, parameter)
    }

    fun getLineageStatement(): String {
        return metadata.dataQualityInfo
            ?.map { it.dqDataQuality?.lineage?.liLinage?.statement?.value }
            ?.getOrNull(0) ?: ""
    }

    fun getMDIdentifier(): String {
        return identificationInfo?.citation?.citation?.identifier
            ?.map { it.mdIdentifier?.code?.value }
            ?.getOrNull(0) ?: ""
    }

    fun getSpatialRepresentationTypes(): List<KeyValue> {
        return identificationInfo?.spatialRepresentationType
            ?.map { it.code?.codeListValue }
            ?.map { codeListService.getCodeListEntryId("526", it, "iso") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getResolutions(): List<Resolution> {
        val scales = identificationInfo?.spatialResolution
            ?.mapNotNull { it.mdResolution?.equivalentScale?.mdRepresentativeFraction?.denominator?.value }
        val groundResolutions = identificationInfo?.spatialResolution
            ?.filter { listOf("meter", "m").contains(it.mdResolution?.distance?.mdDistance?.uom) }
            ?.map { it.mdResolution?.distance?.mdDistance?.value }
        val scanResolutions = identificationInfo?.spatialResolution
            ?.filter { it.mdResolution?.distance?.mdDistance?.uom == "dpi" }
            ?.map { it.mdResolution?.distance?.mdDistance?.value }

        val maxItems = listOf(scales, groundResolutions, scanResolutions).maxOfOrNull { it?.size ?: 0 } ?: 0
        return (0 until maxItems).map {
            Resolution(
                scales?.getOrNull(it),
                groundResolutions?.getOrNull(it),
                scanResolutions?.getOrNull(it)
            )
        }
    }

    fun getPortrayalCatalogueInfo(): List<CatalogInfo> {
        return metadata.portrayalCatalogueInfo
            ?.flatMap {
                it.mdPortrayalCatalogueInfo?.portrayalCatalogueCitation
                    ?.map {
                        val titleValue = it.citation?.title?.value
                        val titleKey = codeListService.getCatalogCodelistKey(catalogId, "3555", titleValue!!)
                        val title = if (titleKey == null) KeyValue(null, titleValue) else KeyValue(titleKey)
                        CatalogInfo(
                            title,
                            it.citation.date.getOrNull(0)?.date?.date?.dateTime,
                            it.citation.edition?.value
                        )
                    } ?: emptyList()
            } ?: emptyList()
    }

    fun getFeatureCatalogueDescription(): List<CatalogInfo> {
        return metadata.contentInfo
            ?.flatMap {
                it.mdFeatureCatalogueDescription?.featureCatalogueCitation
                    ?.map {
                        val titleValue = it.citation?.title?.value
                        val titleKey = codeListService.getCatalogCodelistKey(catalogId, "3535", titleValue!!)
                        val title = if (titleKey == null) KeyValue(null, titleValue) else KeyValue(titleKey)
                        CatalogInfo(
                            title,
                            it.citation.date.getOrNull(0)?.date?.date?.dateTime,
                            it.citation.edition?.value
                        )
                    } ?: emptyList()
            } ?: emptyList()
    }

    fun getPositionalAccuracy(): PositionalAccuracy {
        return PositionalAccuracy(
            getVerticalAbsoluteExternalPositionalAccuracy(),
            getHorizontalAbsoluteExternalPositionalAccuracy(),
            getGriddedDataPositionalAccuracy()
        )
    }

    fun getGeometryContexts(): List<GeometryContextInternal> {
        return metadata.spatialRepresentationInfo
            ?.mapNotNull {it.mdGeometryContext }
            ?.map {
                val feature = it.geometricFeature?.nominalFeature ?: it.geometricFeature?.ordinalFeature ?: it.geometricFeature?.scalarFeature ?: it.geometricFeature?.otherFeature
                GeometryContextInternal(
                    feature?.featureName?.value,
                    it.geometryType?.value,
                    feature?.featureDataType?.value,
                    feature?.featureDescription?.value,
                    mapGeometryContextFeatureType(it.geometricFeature),
                    feature?.minValue?.value?.toDouble(),
                    feature?.maxValue?.value?.toDouble(),
                    feature?.units?.value,
                    mapGeometryContextAttributes(feature?.featureAttributes?.featureAttributes?.attribute)
                )
            } ?: emptyList()
    }
    
    fun getDatasetURI(): String? {
        return metadata.dataSetURI?.value
    }

    private fun mapGeometryContextAttributes(attributes: List<FeatureAttribute>?): List<KeyValue> {
        return attributes?.map { attribute ->
            val item = attribute.RegularFeatureAttribute ?: attribute.OtherFeatureAttribute
            KeyValue(
                item?.attributeCode?.value ?: item?.attributeContent?.value,
                item?.attributeDescription?.value
            )
        } ?: emptyList()
    }

    private fun mapGeometryContextFeatureType(feature: GeometricFeature?): KeyValue? {
        return when {
            feature?.nominalFeature != null -> KeyValue("nominal")
            feature?.ordinalFeature != null -> KeyValue("ordinal")
            feature?.scalarFeature != null -> KeyValue("scalar")
            feature?.otherFeature != null -> KeyValue("other")
            else -> null
        }
    }

    private fun getVerticalAbsoluteExternalPositionalAccuracy(): Double? {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.report
                    ?.filter { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.valueUnit?.unitDefinition?.quantityType == "absolute external positional accuracy, vertical accuracy" }
                    ?.map {
                        it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.value
                            ?.getOrNull(0)?.value
                    } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toDouble()
    }
    private fun getHorizontalAbsoluteExternalPositionalAccuracy(): Double? {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.report
                    ?.filter { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.valueUnit?.unitDefinition?.quantityType == "absolute external positional accuracy, geographic accuracy" }
                    ?.map {
                        it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.value
                            ?.getOrNull(0)?.value
                    } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toDouble()
    }
    private fun getGriddedDataPositionalAccuracy(): Double? {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.report
                    ?.mapNotNull {
                        it.dqGriddedDataPositionalAccuracy?.result?.dqQuantitativeResult?.value
                            ?.getOrNull(0)?.value
                    } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toDouble()
    }
}

data class QualityInfo(
    val type: String,
    val codelist: String,
    val element: DQReportElement
)

data class CatalogInfo(
    val title: KeyValue?,
    val date: String?,
    val edition: String?
)

data class Quality(
    val type: String,
    val measureType: KeyValue?,
    val value: Number?,
    val parameter: String?
)

data class VectorSpatialRepresentation(
    val topologyLevel: KeyValue?,
    val objectType: KeyValue?,
    val objectCount: Number?,
)

data class PositionalAccuracy(
    val vertical: Double?,
    val horizontal: Double?,
    val griddedDataPositionalAccuracy: Double?
)

data class GeometryContextInternal(
    val name: String?,
    val geometryType: String?,
    val dataType: String?,
    val description: String?,
    val featureType: KeyValue?,
    val min: Double?,
    val max: Double?,
    val unit: String?,
    val attributes: List<KeyValue>,
)
