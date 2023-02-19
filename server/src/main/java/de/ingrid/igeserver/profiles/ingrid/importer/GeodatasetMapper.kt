package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.DQReport
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.kotlin.logger

class GeodatasetMapper(metadata: Metadata, codeListService: CodelistHandler) :
    GeneralMapper(metadata, codeListService) {

    val log = logger()
    val identificationInfo = metadata.identificationInfo[0].dataIdentificationInfo

    fun getTopicCategories(): List<KeyValue> {
        return identificationInfo?.topicCategory
            ?.mapNotNull { it.value }
            ?.mapNotNull { codeListService.getCodeListEntryId("527", it, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()

    }

    fun getCharacterSet(): KeyValue? {
        val value = identificationInfo?.characterSet?.get(0)?.code?.codeListValue
        val entryId = codeListService.getCodeListEntryId("510", value, "ISO")
        if (entryId == null) {
            log.warn("Could not map CharacterSet: $value")
            return null
        }

        return KeyValue(entryId)
    }

    fun getLanguages(): List<String> {
        return identificationInfo?.language
            ?.mapNotNull { it.code?.codeListValue }
            ?.map { mapLanguage(it) }
            ?: emptyList()
    }

    fun getFeatureTypes(): List<KeyValue> {
        return metadata.contentInfo
            ?.flatMap { it.mdFeatureCatalogueDescription?.featureTypes
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

    fun getProcessStep(): String {
        return metadata.dataQualityInfo
            ?.flatMap { dqi ->
                dqi.dqDataQuality?.lineage?.liLinage?.processStep
                    ?.mapNotNull { it.liProcessStep.description.value } ?: emptyList()
            }
            ?.joinToString(";") ?: ""
    }

    fun getCompletenessOmissionValue(): Number? {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.report
                    ?.mapNotNull { it.dqCompletenessOmission?.result?.dqQuantitativeResult?.value?.get(0)?.value }
                    ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toInt()
    }

    fun getQualities(): List<Quality> {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report ?: emptyList() }
            ?.mapNotNull { mapQuality(it) } ?: emptyList()
    }

    private fun mapQuality(report: DQReport): Quality? {
        val type =
            if (report.dqTemporalValidity != null) ""
            else if (report.dqTemporalConsistency != null) "temporalConsistency"
//            else if (report.dqAccuracyOfATimeMeasurement != null) ""
            else if (report.dqQuantitativeAttributeAccuracy != null) "quantitativeAttributeAccuracy"
            else if (report.dqNonQuantitativeAttributeAccuracy != null) "nonQuantitativeAttributeAccuracy"
            else if (report.dqThematicClassificationCorrectness != null) "thematicClassificationCorrectness"
            else if (report.dqRelativeInternalPositionalAccuracy != null) "relativeInternalPositionalAccuracy"
//            else if (report.dqGriddedDataPositionalAccuracy != null) ""
//            else if (report.dqAbsoluteExternalPositionalAccuracy != null) ""
            else if (report.dqTopologicalConsistency != null) "topologicalConsistency"
            else if (report.dqFormatConsistency != null) "formatConsistency"
            else if (report.dqDomainConsistency != null) "domainConsistency"
            else if (report.dqConceptualConsistency != null) "conceptualConsistency"
//            else if (report.dqCompletenessOmission != null) "" 
            else if (report.dqCompletenessCommission != null) "completenessComission"
            else return null

        val name = report.dqAccuracyOfATimeMeasurement?.nameOfMeasure?.map { it.value }?.joinToString(";")
        val nameId = null //codeListService.getCodeListEntryId("", name, "ISO")
        val nameKeyValue = if (nameId == null) KeyValue(null, name) else KeyValue(nameId)
        val parameter = report.dqAccuracyOfATimeMeasurement?.measureDescription?.value
        val value =
            report.dqAccuracyOfATimeMeasurement?.result?.dqQuantitativeResult?.value?.getOrNull(0)?.value?.toInt()
        return Quality(type, nameKeyValue, value, parameter)
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
            ?.map { codeListService.getCodeListEntryId("526", it, "ISO") }
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
                        val titleKey = codeListService.getCodeListEntryId("3555", titleValue, "de")
                        val title = if (titleKey == null) KeyValue(null, titleValue) else KeyValue(titleKey)
                        CatalogInfo(
                            title,
                            it.citation?.date?.getOrNull(0)?.date?.date?.dateTime,
                            it.citation?.edition?.value
                        )
                    } ?: emptyList()
            }?: emptyList()
    }

    fun getFeatureCatalogueDescription(): List<CatalogInfo> {
        return metadata.contentInfo
            ?.flatMap {
                it.mdFeatureCatalogueDescription?.featureCatalogueCitation
                    ?.map {
                        val titleValue = it.citation?.title?.value
                        val titleKey = codeListService.getCodeListEntryId("3535", titleValue, "de")
                        val title = if (titleKey == null) KeyValue(null, titleValue) else KeyValue(titleKey)
                        CatalogInfo(
                            title,
                            it.citation?.date?.getOrNull(0)?.date?.date?.dateTime,
                            it.citation?.edition?.value
                        )
                    } ?: emptyList()
            }?: emptyList()
    }

    fun getPositionalAccuracy(): PositionalAccuracy {
        return PositionalAccuracy(
            getVerticalAbsoluteExternalPositionalAccuracy(),
            getHorizontalAbsoluteExternalPositionalAccuracy(),
            getGriddedDataPositionalAccuracy()
        )
    }
    
    private fun getVerticalAbsoluteExternalPositionalAccuracy(): Int? {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report
                ?.filter { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.valueUnit?.unitDefinition?.quantityType == "absolute external positional accuracy, vertical accuracy" }
                ?.map { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.value
                    ?.getOrNull(0)?.value } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toInt()
    }
    private fun getHorizontalAbsoluteExternalPositionalAccuracy(): Int? {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report
                ?.filter { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.valueUnit?.unitDefinition?.quantityType == "absolute external positional accuracy, geographic accuracy" }
                ?.map { it.dqAbsoluteExternalPositionalAccuracy?.result?.dqQuantitativeResult?.value
                    ?.getOrNull(0)?.value } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toInt()
    }
    private fun getGriddedDataPositionalAccuracy(): Int? {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report
                ?.mapNotNull { it.dqGriddedDataPositionalAccuracy?.result?.dqQuantitativeResult?.value
                    ?.getOrNull(0)?.value } ?: emptyList()
            }
            ?.getOrNull(0)
            ?.toInt()
    }
}

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

data class PositionalAccuracy(
    val vertical: Int?,
    val horizontal: Int?,
    val griddedDataPositionalAccuracy: Int?
)