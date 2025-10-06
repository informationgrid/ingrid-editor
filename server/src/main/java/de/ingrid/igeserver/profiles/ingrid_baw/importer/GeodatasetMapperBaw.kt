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

    fun getTimestep(): Double? = isoData.data.dataQualityInfo
        ?.mapNotNull { it.dqDataQuality }
        ?.flatMap { it.report ?: emptyList() }
        ?.find { it.dqAccuracyOfATimeMeasurement != null }
        ?.dqAccuracyOfATimeMeasurement?.result?.dqQuantitativeResult?.value?.firstOrNull()?.value?.toDoubleOrNull()

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
                    value = result.value.firstOrNull()?.value,
                    unit = result.valueUnit.unitDefinition?.catalogSymbol,
                )
            } else {
                null
            }
        } ?: emptyList()
}

data class SimulationParameter(
    val name: String,
    val role: KeyValue?,
    val value: String?,
    val unit: String?,
)
