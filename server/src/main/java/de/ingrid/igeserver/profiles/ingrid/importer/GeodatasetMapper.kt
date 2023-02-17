package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.DQReport
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.udk.UtilsCountryCodelist
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
            ?.map { UtilsCountryCodelist.getCodeFromShortcut3(it).toString() }
//            ?.map { KeyValue(it.toString()) } 
            ?: emptyList()
    }

    fun getFeatureTypes(): List<KeyValue> {
        return emptyList()
    }

    fun getSourceDescriptions(): List<KeyValue> {
        return metadata.dataQualityInfo
            ?.flatMap { dqi ->
                dqi.dqDataQuality?.lineage?.liLinage?.source
                    ?.map { it.liSource?.description?.value } ?: emptyList()
            }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getProcessStep(): String {
        return metadata.dataQualityInfo
            ?.flatMap { dqi ->
                dqi.dqDataQuality?.lineage?.liLinage?.processStep
                    ?.mapNotNull { it.liProcessStep?.description?.value } ?: emptyList()
            }
            ?.joinToString { ";" } ?: ""
    }
    
    fun getCompletenessOmissionValue(): Number? {
        return metadata.dataQualityInfo
            ?.flatMap { it.dqDataQuality?.report
                ?.mapNotNull { it.dqCompletenessOmission?.result?.dqQuantitativeResult?.value?.get(0)?.value } ?: emptyList()
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
        val value = report.dqAccuracyOfATimeMeasurement?.result?.dqQuantitativeResult?.value?.getOrNull(0)?.value?.toInt()
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
}

data class Quality(
    val type: String,
    val measureType: KeyValue?,
    val value: Number?,
    val parameter: String?
)