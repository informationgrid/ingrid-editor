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
package de.ingrid.igeserver.profiles.ingrid_baw.importer

import de.ingrid.igeserver.exports.iso.BawStructuralEngineeringSimulation
import de.ingrid.igeserver.exports.iso.MDDataIdentification
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData

class GeodatasetMapperBaw(isoData: IsoImportData) : GeodatasetMapper(isoData) {
    override val splitSpatialSystems = true
    override val type = hierarchyLevelNameToDocumentType(metadata.hierarchyLevelName?.get(0)?.value)

    override fun getKeywords(): List<String> = super.getKeywords(BAW_THESAURI)

    fun getBawKeywords(): List<KeyValue> = getBawKeywords(metadata, codeListService)

    fun getSubsoilKeywords(): List<KeyValue> = getSubsoilKeywords(metadata, codeListService)

    fun getLiteratureReferences(): List<String> = getLiteratureReferences(identificationInfo)

    fun getDimensionality(): KeyValue? = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "de.baw.codelist.model.dimensionality" }
        ?.flatMap { thesaurus -> thesaurus.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
        ?.map { KeyValue(codeListService.getCodeListEntryId("3950000", it, "de"), it, "3950000") }?.firstOrNull()

    private fun getMethods(codelistId: String): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "de.baw.codelist.model.method" }
        ?.flatMap { thesaurus -> thesaurus.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
        ?.map { KeyValue(codeListService.getCodeListEntryId(codelistId, it, "de"), it, codelistId) } ?: emptyList()

    fun getMeasuringMethod(): List<KeyValue> = getMethods("3950011")

    fun getSimProcess(): KeyValue? = getMethods("3950001").firstOrNull()

    fun getSimulationModelTypes(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "de.baw.codelist.model.type" }
        ?.flatMap { thesaurus -> thesaurus.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
        ?.map { KeyValue(codeListService.getCodeListEntryId("3950003", it, "de"), it, "3950003") } ?: emptyList()

    fun getOrderTitle(): String? = identificationInfo?.aggregationInfo?.find { it.mdAggregateInformation?.associationType?.code?.codeListValue == "largerWorkCitation" }
        ?.mdAggregateInformation?.aggregateDataSetName?.citation?.title?.value

    fun getOrderNumber(): String? = identificationInfo?.aggregationInfo?.find { it.mdAggregateInformation?.associationType?.code?.codeListValue == "largerWorkCitation" }
        ?.mdAggregateInformation?.aggregateDataSetName?.citation?.identifier?.firstOrNull()?.mdIdentifier?.code?.value

    fun getBawOrderInfo(): KeyValue? {
        val number = getOrderNumber()
        val title = getOrderTitle()
        if (number == null && title == null) return null

        val combinedValue = when {
            number != null && title != null -> "$number - $title"
            number != null -> number
            else -> title!!
        }.trim()

        return KeyValue(codeListService.getCodeListEntryId("bawOrderInfo", combinedValue, "de"), combinedValue, "bawOrderInfo")
    }

    fun getTimestep(): Double? = isoData.data.dataQualityInfo
        ?.mapNotNull { it.dqDataQuality }
        ?.flatMap { it.report ?: emptyList() }
        ?.find { it.dqAccuracyOfATimeMeasurement != null }
        ?.dqAccuracyOfATimeMeasurement?.result?.dqQuantitativeResult?.value?.firstOrNull()?.value?.value?.toDoubleOrNull()

    fun getSimulationParameters(): List<SimulationParameter> = isoData.data.dataQualityInfo
        ?.filter { it.dqDataQuality?.report?.any { it.dqQuantitativeAttributeAccuracy != null } == true }
        ?.mapNotNull { dataQualityInfo ->
            val quantitativeReport =
                dataQualityInfo.dqDataQuality?.report?.firstOrNull()?.dqQuantitativeAttributeAccuracy
            val roleValue =
                dataQualityInfo.dqDataQuality?.lineage?.liLinage?.source?.firstOrNull()?.liSource?.description?.value

            val result = quantitativeReport?.result?.dqQuantitativeResult
            val name = result?.valueType?.recordType

            if (name != null) {
                SimulationParameter(
                    name = name,
                    role = if (roleValue != null) {
                        KeyValue(codeListService.getCodeListEntryId("3950004", roleValue, "de"), roleValue, "3950004")
                    } else {
                        null
                    },
                    value = result.value.firstOrNull()?.value?.value,
                    unit = result.valueUnit.unitDefinition?.catalogSymbol,
                )
            } else {
                null
            }
        } ?: emptyList()

    fun getBautechnikSimulation(): BautechnikSimulationImport? {
        val raw = getSupplementalInformation()?.bawMetadata
            ?.simulation?.simulation?.structuralEngineeringSimulation?.structuralEngineeringSimulation
            ?: return null
        return mapBautechnikSimulation(raw)
    }

    fun getWaterMeasurement(): WaterMeasurementImport? {
        val raw = getSupplementalInformation()?.bawMetadata
            ?.measurement?.measurement?.hydraulicEngineeringMeasurement?.hydraulicEngineeringMeasurement
            ?: return null
        return mapWaterMeasurement(raw)
    }

    fun getGauge(): List<GaugeImport> {
        val raw = getSupplementalInformation()?.bawMetadata
            ?.measurement?.measurement?.measurementDevice
            ?: return emptyList()
        return raw.mapNotNull { it.measurementDevice }.map { device ->
            GaugeImport(
                deviceName = device.deviceName?.value,
                deviceId = device.deviceId?.value,
                deviceModel = device.deviceModel?.value,
                description = device.description?.value,
            )
        }
    }

    fun getTargetParameters(): List<TargetParameterImport> {
        val raw = getSupplementalInformation()?.bawMetadata
            ?.measurement?.measurement?.measurementParameter
            ?: return emptyList()
        return raw.mapNotNull { it.measurementParameter }.map { param ->
            TargetParameterImport(
                parameterName = param.parameterName?.value,
                parameterType = param.parameterType?.value?.let { type -> codelistKeyValue("BAW_measurementParameterType", type) },
                uom = param.uom?.value,
                parameterFunction = param.parameterFunction?.value,
            )
        }
    }

    private fun getSupplementalInformation(): de.ingrid.igeserver.exports.iso.CharacterString? {
        val identification = metadata.identificationInfo.firstOrNull()?.identificationInfo
        return (identification as? MDDataIdentification)?.supplementalInformation
    }

    private fun mapWaterMeasurement(raw: de.ingrid.igeserver.exports.iso.BawHydraulicEngineeringMeasurement): WaterMeasurementImport = WaterMeasurementImport(
        spatiality = raw.measurementSpatiality?.value?.let { codelistKeyValue("BAW_measurementSpatiality", it) },
        measuringDepth = raw.measurementDepth?.mapNotNull { it.measurementDepth }?.map {
            ValueUnitImport(
                value = it.measurementDepth?.value,
                unit = null,
                verticalCRS = it.verticalCRS?.value?.let { crs -> codelistKeyValue("BAW_verticalCRS", crs) },
            )
        } ?: emptyList(),
        timestep = raw.temporalAccuracy?.value ?: getTimestep(),
        frequency = raw.measurementFrequency?.value,
        averageWaterLevel = raw.meanWaterLevel?.mapNotNull { it.meanWaterLevel }?.map {
            ValueUnitImport(
                value = it.waterLevel?.value,
                unit = it.uom?.value,
            )
        } ?: emptyList(),
        zeroLevel = raw.gaugeZeroPoint?.mapNotNull { it.gaugeZeroPoint }?.map {
            ValueUnitImport(
                value = it.gaugeZeroPoint?.value,
                unit = it.uom?.value,
                verticalCRS = it.verticalCRS?.value?.let { crs -> codelistKeyValue("BAW_verticalCRS", crs) },
                description = it.description?.value,
            )
        } ?: emptyList(),
        drain = DrainImport(
            min = raw.minDischarge?.value,
            max = raw.maxDischarge?.value,
        ),
        dataQualityDescription = raw.dataQualityDescription?.value,
    )

    private fun mapBautechnikSimulation(raw: BawStructuralEngineeringSimulation): BautechnikSimulationImport {
        fun strings(list: List<de.ingrid.igeserver.exports.iso.CharacterString>?): List<String> = list?.mapNotNull { it.value }?.filter { it.isNotBlank() } ?: emptyList()

        val materialLinear = raw.materialConcept?.value?.let { it == "linear" }
        val geometricLinear = raw.geometryConcept?.value?.let { it == "linear" }
        val imperfections = raw.imperfections?.value?.let { it == "with" }

        val calculationConcept = if (materialLinear != null || geometricLinear != null || imperfections != null) {
            CalculationConceptImport(
                isMaterialLinear = materialLinear,
                isGeometricLinear = geometricLinear,
                hasImperfections = imperfections,
            )
        } else {
            null
        }

        val reinforcement = raw.reinforcementYieldStrength?.mapNotNull { it.value }
            ?.map { YieldLimitImport(it) } ?: emptyList()
        val steel = raw.steelYieldStrength?.mapNotNull { it.value }
            ?.map { YieldLimitImport(it) } ?: emptyList()
        val concrete = raw.concreteCompressiveStrength?.mapNotNull { it.concreteCompressiveStrength }
            ?.map { ccs ->
                val unitValue = ccs.parameter?.value
                ConcreteImport(
                    compressiveStrength = ccs.concreteCompressiveStrength?.value,
                    unitOfMeasure = unitValue?.let {
                        KeyValue(
                            codeListService.getCodeListEntryId("BAW_simulationConcreteUnit", it, "de"),
                            it,
                            "BAW_simulationConcreteUnit",
                        )
                    },
                )
            } ?: emptyList()

        val materialParameters = if (reinforcement.isNotEmpty() || steel.isNotEmpty() || concrete.isNotEmpty()) {
            MaterialParametersImport(reinforcement, steel, concrete)
        } else {
            null
        }

        return BautechnikSimulationImport(
            objects = strings(raw.objects).map { codelistKeyValue("BAW_simulationObject", it) },
            objectPart = strings(raw.objectPart).map { codelistKeyValue("BAW_simulationObjectPart", it) },
            researchGoal = strings(raw.investigationGoal).map { codelistKeyValue("BAW_simulationResearchGoal", it) },
            dimension = DimensionImport(
                spatialDimension = raw.spatialDimensionality?.value?.let { codelistKeyValue("BAW_simulationSpatialDimension", it) },
                timeDimension = raw.timeDimension?.value,
            ),
            level = strings(raw.investigationLevel).map { codelistKeyValue("BAW_simulationLevel", it) },
            phase = strings(raw.investigationStage).map { codelistKeyValue("BAW_simulationPhase", it) },
            calculationConcept = calculationConcept,
            materials = strings(raw.materials).map { codelistKeyValue("BAW_simulationMaterial", it) },
            materialParameters = materialParameters,
            materialModel = strings(raw.materialModel).map { codelistKeyValue("BAW_simulationMaterialModel", it) },
            elementTypes = strings(raw.elementType).map { codelistKeyValue("BAW_simulationElementType", it) },
            effects = strings(raw.impact).map { codelistKeyValue("BAW_simulationEffect", it) },
            physics = strings(raw.physics).map { codelistKeyValue("BAW_simulationPhysics", it) },
            analysisType = strings(raw.analysisType).map { codelistKeyValue("BAW_simulationAnalysisType", it) },
        )
    }

    private fun codelistKeyValue(codelistId: String, value: String): KeyValue = KeyValue(codeListService.getCodeListEntryId(codelistId, value, "de"), value, codelistId)
}

data class BautechnikSimulationImport(
    val objects: List<KeyValue>,
    val objectPart: List<KeyValue>,
    val researchGoal: List<KeyValue>,
    val dimension: DimensionImport,
    val level: List<KeyValue>,
    val phase: List<KeyValue>,
    val calculationConcept: CalculationConceptImport?,
    val materials: List<KeyValue>,
    val materialParameters: MaterialParametersImport?,
    val materialModel: List<KeyValue>,
    val elementTypes: List<KeyValue>,
    val effects: List<KeyValue>,
    val physics: List<KeyValue>,
    val analysisType: List<KeyValue>,
)

data class DimensionImport(
    val spatialDimension: KeyValue?,
    val timeDimension: Boolean?,
)

data class CalculationConceptImport(
    val isMaterialLinear: Boolean?,
    val isGeometricLinear: Boolean?,
    val hasImperfections: Boolean?,
)

data class MaterialParametersImport(
    val reinforcement: List<YieldLimitImport>,
    val steel: List<YieldLimitImport>,
    val concrete: List<ConcreteImport>,
)

data class YieldLimitImport(
    val yieldLimit: Double,
)

data class ConcreteImport(
    val compressiveStrength: Double?,
    val unitOfMeasure: KeyValue?,
)

data class WaterMeasurementImport(
    val spatiality: KeyValue?,
    val measuringDepth: List<ValueUnitImport>,
    val timestep: Double?,
    val frequency: Double?,
    val averageWaterLevel: List<ValueUnitImport>,
    val zeroLevel: List<ValueUnitImport>,
    val drain: DrainImport,
    val dataQualityDescription: String?,
)

data class ValueUnitImport(
    val value: Double?,
    val unit: String?,
    val verticalCRS: KeyValue? = null,
    val description: String? = null,
)

data class DrainImport(
    val min: Double?,
    val max: Double?,
)

data class GaugeImport(
    val deviceName: String?,
    val deviceId: String?,
    val deviceModel: String?,
    val description: String?,
)

data class TargetParameterImport(
    val parameterName: String?,
    val parameterType: KeyValue?,
    val uom: String?,
    val parameterFunction: String?,
)

data class SimulationParameter(
    val name: String,
    val role: KeyValue?,
    val value: String?,
    val unit: String?,
)
