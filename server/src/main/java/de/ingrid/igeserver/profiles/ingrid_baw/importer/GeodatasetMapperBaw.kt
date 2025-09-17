/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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

import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData

class GeodatasetMapperBaw(isoData: IsoImportData) : GeodatasetMapper(isoData) {
    override val splitSpatialSystems = true
    override val type = hierarchyLevelNameToDocumentType(metadata.hierarchyLevelName?.get(0)?.value)

    fun getOrderTitle(): String? = identificationInfo?.aggregationInfo?.find { it.mdAggregateInformation?.associationType?.code?.codeListValue == "largerWorkCitation" }
        ?.mdAggregateInformation?.aggregateDataSetName?.citation?.title?.value

    fun getOrderNumber(): String? = identificationInfo?.aggregationInfo?.find { it.mdAggregateInformation?.associationType?.code?.codeListValue == "largerWorkCitation" }
        ?.mdAggregateInformation?.aggregateDataSetName?.citation?.identifier?.firstOrNull()?.mdIdentifier?.code?.value

    fun getLiteratureReferences(): List<String> = identificationInfo?.aggregationInfo?.mapNotNull { it.mdAggregateInformation?.aggregateDataSetName?.uuidref } ?: emptyList()

    fun getTimestep(): Double? = isoData.data.dataQualityInfo
        ?.mapNotNull { it.dqDataQuality }
        ?.flatMap { it.report ?: emptyList() }
        ?.find { it.dqAccuracyOfATimeMeasurement != null }
        ?.dqAccuracyOfATimeMeasurement?.result?.dqQuantitativeResult?.value?.firstOrNull()?.value?.toDoubleOrNull()

    fun getSimulationParameters(): List<SimulationParameter> = isoData.data.dataQualityInfo
        ?.mapNotNull { it.dqDataQuality }
        ?.flatMap { it.report ?: emptyList() }
        ?.filter { it.dqQuantitativeAttributeAccuracy != null }
        ?.mapNotNull { report ->
            val quantitativeReport = report.dqQuantitativeAttributeAccuracy
            val result = quantitativeReport?.result?.dqQuantitativeResult
            val name = result?.valueType?.recordType
            val unit = result?.valueUnit?.unitDefinition?.name
            val value = result?.value?.firstOrNull()?.value
            val role = quantitativeReport?.let { qr ->
                // Try to get role from lineage if available
                isoData.data.dataQualityInfo
                    ?.mapNotNull { it.dqDataQuality }
                    ?.firstOrNull()?.lineage?.liLinage?.source?.firstOrNull()?.liSource?.description?.value
            }

            if (name != null) {
                SimulationParameter(
                    name = name,
                    role = role,
                    value = value,
                    unit = unit,
                )
            } else {
                null
            }
        } ?: emptyList()
}

data class SimulationParameter(
    val name: String,
    val role: String?,
    val value: String?,
    val unit: String?,
)
