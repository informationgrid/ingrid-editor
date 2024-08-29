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
package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.profiles.ingrid.exporter.model.ConformanceResult
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Quality

open class GeodatasetModelTransformer(transformerConfig: TransformerConfig) :
    IngridModelTransformer(transformerConfig) {

    private val isSeries = model.data.subType?.key == "6"

    override val hierarchyLevel = if (isSeries) "series" else "dataset"
    override val hierarchyLevelName: String? = if (isSeries) "series" else null

    val featureCatalogueDescription = model.data.featureCatalogueDescription
    val isAdVCompatible = model.data.isAdVCompatible ?: false
    val featureTypes =
        model.data.featureCatalogueDescription?.featureTypes?.map { codelists.getValue("", it) } ?: emptyList()
    val citations = model.data.featureCatalogueDescription?.citation ?: emptyList()

    val completenessOmission = model.data.dataQuality?.completenessOmission?.measResult
    val verticalPositionalAccuracy = model.data.absoluteExternalPositionalAccuracy?.vertical
    val horizontalPositionalAccuracy = model.data.absoluteExternalPositionalAccuracy?.horizontal
    val griddedDataPositionalAccuracy = model.data.absoluteExternalPositionalAccuracy?.griddedDataPositionalAccuracy

    val conformanceResult = model.data.conformanceResult ?: emptyList()

    data class DisplayableQuality(
        val tagName: String,
        val unitDefinition: String,
        val value: String,
        val measureDescription: String?,
        val measureIdentification: String?,
        val nameOfMeasure: String,
    )

    private val qualitytypeCodelistMap = mapOf(
        "completenessComission" to "7109",
        "conceptualConsistency" to "7112",
        "domainConsistency" to "7113",
        "formatConsistency" to "7114",
        "topologicalConsistency" to "7115",
        "temporalConsistency" to "7120",
        "thematicClassificationCorrectness" to "7125",
        "nonQuantitativeAttributeAccuracy" to "7126",
        "quantitativeAttributeAccuracy" to "7127",
        "relativeInternalPositionalAccuracy" to "7128",
    )

    private val qualitytypeTagnameMap = mapOf(
        "completenessComission" to "DQ_CompletenessCommission",
        "conceptualConsistency" to "DQ_ConceptualConsistency",
        "domainConsistency" to "DQ_DomainConsistency",
        "formatConsistency" to "DQ_FormatConsistency",
        "topologicalConsistency" to "DQ_TopologicalConsistency",
        "temporalConsistency" to "DQ_TemporalConsistency",
        "thematicClassificationCorrectness" to "DQ_ThematicClassificationCorrectness",
        "nonQuantitativeAttributeAccuracy" to "DQ_NonQuantitativeAttributeAccuracy",
        "quantitativeAttributeAccuracy" to "DQ_QuantitativeAttributeAccuracy",
        "relativeInternalPositionalAccuracy" to "DQ_RelativeInternalPositionalAccuracy",
    )

    private fun getMeasureIdentification(type: String, measureKey: String?): String? {
        return when (type) {
            "completenessComission" -> return when (measureKey) {
                "1" -> "3"
                "2" -> "4"
                else -> null
            }

            "conceptualConsistency" -> return when (measureKey) {
                "1" -> "11"
                "2" -> "13"
                else -> null
            }

            "domainConsistency" -> return when (measureKey) {
                "1" -> "17"
                else -> null
            }

            "formatConsistency" -> return when (measureKey) {
                "1" -> "20"
                else -> null
            }

            "topologicalConsistency" -> return when (measureKey) {
                "1" -> "11"
                "2" -> "23"
                "3" -> "24"
                "4" -> "25"
                "5" -> "26"
                "6" -> "27"
                "7" -> "21"
                "8" -> "missing"
                "9" -> "missing"
                "10" -> "missing"
                "11" -> "missing"
                else -> null
            }

            "temporalConsistency" -> return when (measureKey) {
                "1" -> "missing"
                else -> null
            }

            "thematicClassificationCorrectness" -> return when (measureKey) {
                "1" -> "61"
                else -> null
            }

            "nonQuantitativeAttributeAccuracy" -> return when (measureKey) {
                "1" -> "67"
                else -> null
            }

            "quantitativeAttributeAccuracy" -> return when (measureKey) {
                "1" -> "71"
                else -> null
            }

            "relativeInternalPositionalAccuracy" -> return "28"
            else -> ""
        }
    }

    fun mapConformanceResultTitle(result: ConformanceResult): String? {
        return when (result.isInspire) {
            true -> codelists.getValue("6005", result.specification, "iso") ?: codelists.getValue("6005", result.specification, "de")
            else -> codelists.getCatalogCodelistValue("6006", result.specification)
        }
    }

    private val unknownValueUnit = "<gmd:valueUnit gco:nilReason=\"unknown\"/>"
    private val inapplicableValueUnit = "<gmd:valueUnit gco:nilReason=\"inapplicable\"/>"
    private fun percentageValueUnit(quantityType: String) = """
        <gmd:valueUnit>
            <gml:UnitDefinition gml:id="unitDefinition_ID_${TransformationTools.getRandomUUID()}">
                <gml:identifier codeSpace=""/>
                <gml:name>percent</gml:name>
                <gml:quantityType>$quantityType</gml:quantityType>
                <gml:catalogSymbol>%</gml:catalogSymbol>
            </gml:UnitDefinition>
        </gmd:valueUnit>
    """.trimIndent()

    private fun meterValueUnit(quantityType: String) = """
        <gmd:valueUnit>
            <gml:UnitDefinition gml:id="unitDefinition_ID_${TransformationTools.getRandomUUID()}">
                <gml:identifier codeSpace=""/>
                <gml:name>meter</gml:name>
                <gml:quantityType>$quantityType</gml:quantityType>
                <gml:catalogSymbol>m</gml:catalogSymbol>
            </gml:UnitDefinition>
        </gmd:valueUnit>
    """.trimIndent()

    fun getUnitDefinition(type: String, measureKey: String): String {
        return when (type) {
            "completenessComission" -> {
                return when (measureKey) {
                    "1" -> percentageValueUnit("completeness commission")
                    "2" -> inapplicableValueUnit
                    else -> unknownValueUnit
                }
            }

            "conceptualConsistency" -> return when (measureKey) {
                "1" -> inapplicableValueUnit
                "2" -> percentageValueUnit("conceptual consistency")
                else -> unknownValueUnit
            }

            "domainConsistency" -> return when (measureKey) {
                "1" -> percentageValueUnit("domain consistency")
                else -> unknownValueUnit
            }

            "formatConsistency" -> return when (measureKey) {
                "1" -> percentageValueUnit("format consistency")
                else -> unknownValueUnit
            }

            "topologicalConsistency" -> return when (measureKey) {
                "-1" -> unknownValueUnit
                else -> inapplicableValueUnit
            }

            "temporalConsistency" -> return when (measureKey) {
                "1" -> percentageValueUnit("temporal consistency")
                else -> unknownValueUnit
            }

            "thematicClassificationCorrectness" -> return when (measureKey) {
                "1" -> percentageValueUnit("thematic classification correctness")
                else -> unknownValueUnit
            }

            "nonQuantitativeAttributeAccuracy" -> return when (measureKey) {
                "1" -> percentageValueUnit("non quantitative attribute accuracy")
                else -> unknownValueUnit
            }

            "quantitativeAttributeAccuracy" -> return when (measureKey) {
                "1" -> inapplicableValueUnit
                else -> unknownValueUnit
            }

            "relativeInternalPositionalAccuracy" -> meterValueUnit("relative internal positional accuracy")
            else -> ""
        }
    }

    fun getDisplayableQuality(quality: Quality): DisplayableQuality {
        return DisplayableQuality(
            nameOfMeasure = codelists.getValue(
                qualitytypeCodelistMap.getOrDefault(quality._type, ""), quality.measureType,
            ) ?: "",
            tagName = qualitytypeTagnameMap.getOrDefault(quality._type, ""),
            measureIdentification = getMeasureIdentification(quality._type, quality.measureType?.key),
            measureDescription = quality.parameter,
            value = quality.value.toString(),
            unitDefinition = getUnitDefinition(quality._type, quality.measureType?.key ?: "-1"),
        )
    }

    val qualities = model.data.qualities?.map { getDisplayableQuality(it) } ?: emptyList()

    val lineageStatement = model.data.lineage?.statement
    val lineageProcessStepDescriptions =
        data.dataQualityInfo?.lineage?.source?.processStep?.description?.map { codelists.getValue("", it) }
            ?: emptyList()
    val lineageSourceDescriptions =
        data.dataQualityInfo?.lineage?.source?.descriptions?.map { codelists.getValue("", it) } ?: emptyList()
    val hasLineageInformation =
        !lineageStatement.isNullOrEmpty() || lineageProcessStepDescriptions.isNotEmpty() || lineageSourceDescriptions.isNotEmpty()

    val portrayalCatalogueCitations = model.data.portrayalCatalogueInfo?.citation ?: emptyList()
}
