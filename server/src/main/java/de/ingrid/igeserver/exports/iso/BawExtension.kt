/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty

/**
 * BAW-specific XML extension that lives inside `gmd:supplementalInformation`.
 * Namespace: https://dl.datenrepository.baw.de/schemas/bawmd
 */
data class BawExtension(
    @JacksonXmlProperty(localName = "BAW_Metadata") val bawMetadata: BawMetadata?,
)

data class BawMetadata(
    val simulation: BawSimulationWrapper? = null,
    val measurement: BawMeasurementWrapper? = null,
)

data class BawSimulationWrapper(
    @JacksonXmlProperty(localName = "Simulation") val simulation: BawSimulation?,
)

data class BawMeasurementWrapper(
    @JacksonXmlProperty(localName = "Measurement") val measurement: BawMeasurement?,
)

data class BawSimulation(
    @JacksonXmlElementWrapper(useWrapping = false)
    val simulationMethod: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val simulationMethodVersion: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val simulationMethodDependency: List<CharacterString>? = null,
    val structuralEngineeringSimulation: BawStructuralEngineeringSimulationWrapper? = null,
    val shipCFD: BawShipCFDWrapper? = null,
)

data class BawMeasurement(
    @JacksonXmlElementWrapper(useWrapping = false)
    val measurementMethod: List<CharacterString>? = null,
    val measurementDevice: List<BawMeasurementDeviceWrapper>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val measurementParameter: List<BawMeasurementParameterWrapper>? = null,
    val hydraulicEngineeringMeasurement: BawHydraulicEngineeringMeasurementWrapper? = null,
)

data class BawMeasurementDeviceWrapper(
    val measurementDevice: BawMeasurementDevice?,
)

data class BawMeasurementDevice(
    val deviceName: CharacterString? = null,
    val deviceId: CharacterString? = null,
    val deviceModel: CharacterString? = null,
    val description: CharacterString? = null,
)

data class BawMeasurementParameterWrapper(
    @JacksonXmlProperty(localName = "MeasurementParameter")
    val measurementParameter: BawMeasurementParameter?,
)

data class BawMeasurementParameter(
    val parameterName: CharacterString? = null,
    val parameterType: CharacterString? = null,
    val uom: CharacterString? = null,
    val parameterFunction: CharacterString? = null,
)

data class BawHydraulicEngineeringMeasurementWrapper(
    @JacksonXmlProperty(localName = "HydraulicEngineeringMeasurement")
    val hydraulicEngineeringMeasurement: BawHydraulicEngineeringMeasurement?,
)

data class BawHydraulicEngineeringMeasurement(
    val measurementSpatiality: CharacterString? = null,
    val temporalAccuracy: BawDecimal? = null,
    val measurementFrequency: BawDecimal? = null,
    val measurementDepth: List<BawMeasurementDepthWrapper>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val gaugeZeroPoint: List<BawGaugeZeroPointWrapper>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val meanWaterLevel: List<BawMeanWaterLevelWrapper>? = null,
    val minDischarge: BawDecimal? = null,
    val maxDischarge: BawDecimal? = null,
    val dataQualityDescription: CharacterString? = null,
)

data class BawMeasurementDepthWrapper(
    @JacksonXmlProperty(localName = "MeasurementDepth")
    val measurementDepth: BawMeasurementDepth?,
)

data class BawMeasurementDepth(
    val measurementDepth: BawDecimal? = null,
    val verticalCRS: CharacterString? = null,
)

data class BawGaugeZeroPointWrapper(
    @JacksonXmlProperty(localName = "GaugeZeroPoint")
    val gaugeZeroPoint: BawGaugeZeroPoint?,
)

data class BawGaugeZeroPoint(
    val gaugeZeroPoint: BawDecimal? = null,
    val uom: CharacterString? = null,
    val verticalCRS: CharacterString? = null,
    val description: CharacterString? = null,
)

data class BawMeanWaterLevelWrapper(
    @JacksonXmlProperty(localName = "MeanWaterLevel")
    val meanWaterLevel: BawMeanWaterLevel?,
)

data class BawMeanWaterLevel(
    val waterLevel: BawDecimal? = null,
    val uom: CharacterString? = null,
)

data class BawStructuralEngineeringSimulationWrapper(
    @JacksonXmlProperty(localName = "StructuralEngineeringSimulation")
    val structuralEngineeringSimulation: BawStructuralEngineeringSimulation?,
)

data class BawStructuralEngineeringSimulation(
    @JacksonXmlElementWrapper(useWrapping = false)
    @JacksonXmlProperty(localName = "object") val objects: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val objectPart: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val investigationGoal: List<CharacterString>? = null,
    val spatialDimensionality: CharacterString? = null,
    val timeDimension: BawBoolean? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val investigationLevel: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val investigationStage: List<CharacterString>? = null,
    val materialConcept: CharacterString? = null,
    val geometryConcept: CharacterString? = null,
    val imperfections: CharacterString? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val materials: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val reinforcementYieldStrength: List<BawDecimal>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val steelYieldStrength: List<BawDecimal>? = null,
    val concreteCompressiveStrength: BawConcreteCompressiveStrengthWrapper? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val materialModel: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val elementType: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val impact: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val physics: List<CharacterString>? = null,
    @JacksonXmlElementWrapper(useWrapping = false)
    val analysisType: List<CharacterString>? = null,
)

data class BawConcreteCompressiveStrengthWrapper(
    @JacksonXmlProperty(localName = "ConcreteCompressiveStrength")
    val concreteCompressiveStrength: List<BawConcreteCompressiveStrength>?,
)

data class BawConcreteCompressiveStrength(
    val concreteCompressiveStrength: BawDecimal? = null,
    val parameter: CharacterString? = null,
)

data class BawShipCFDWrapper(
    @JacksonXmlProperty(localName = "ShipCFD") val shipCFD: BawShipCFD?,
)

data class BawShipCFD(
    @JacksonXmlElementWrapper(useWrapping = false)
    val shipName: List<CharacterString>? = null,
    val statementAboutPhysics: CharacterString? = null,
    val constantCrossSection: BawBoolean? = null,
    val propulsion: BawBoolean? = null,
    val movementTypes: CharacterString? = null,
    val trajectory: CharacterString? = null,
    val cellCount: BawInteger? = null,
)

data class BawDecimal(
    @JacksonXmlProperty(localName = "Decimal") val value: Double?,
)

data class BawInteger(
    @JacksonXmlProperty(localName = "Integer") val value: Int?,
)

data class BawBoolean(
    @JacksonXmlProperty(localName = "Boolean") val value: Boolean?,
)
