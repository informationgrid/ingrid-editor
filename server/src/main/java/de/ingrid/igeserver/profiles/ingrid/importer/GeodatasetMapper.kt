package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.DQReport
import de.ingrid.igeserver.exports.iso.DQReportElement
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler
import org.apache.logging.log4j.LogManager

class GeodatasetMapper(metadata: Metadata, codeListService: CodelistHandler, catalogId: String) :
    GeneralMapper(metadata, codeListService, catalogId) {

    companion object {
        private val log = LogManager.getLogger()
    }
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

    fun getSubtype(): KeyValue? {
        val value = metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue ?: return null
        return codeListService.getCodeListEntryId("525", value, "iso")
            ?.let { KeyValue(it) }
    }

    private fun mapQuality(report: DQReport): Quality? {
        val info =
            // if (report.dqTemporalValidity != null) QualityInfo("temporalValidity", "", report.dqTemporalValidity)
            if (report.dqTemporalConsistency != null) QualityInfo("temporalConsistency", "7120", report.dqTemporalConsistency)
//            else if (report.dqAccuracyOfATimeMeasurement != null) QualityInfo("", ", (report.)
            else if (report.dqQuantitativeAttributeAccuracy != null) QualityInfo("quantitativeAttributeAccuracy", "7127", report.dqQuantitativeAttributeAccuracy)
            else if (report.dqNonQuantitativeAttributeAccuracy != null) QualityInfo("nonQuantitativeAttributeAccuracy", "7126", report.dqNonQuantitativeAttributeAccuracy)
            else if (report.dqThematicClassificationCorrectness != null) QualityInfo("thematicClassificationCorrectness", "7125", report.dqThematicClassificationCorrectness)
            else if (report.dqRelativeInternalPositionalAccuracy != null) QualityInfo("relativeInternalPositionalAccuracy", "7128", report.dqRelativeInternalPositionalAccuracy)
//            else if (report.dqGriddedDataPositionalAccuracy != null) QualityInfo("", ", (report.)
//            else if (report.dqAbsoluteExternalPositionalAccuracy != null) QualityInfo("", ", (report.)
            else if (report.dqTopologicalConsistency != null) QualityInfo("topologicalConsistency", "7115", report.dqTopologicalConsistency)
            else if (report.dqFormatConsistency != null) QualityInfo("formatConsistency", "7114", report.dqFormatConsistency)
            else if (report.dqDomainConsistency != null) QualityInfo("domainConsistency", "7113", report.dqDomainConsistency)
            else if (report.dqConceptualConsistency != null) QualityInfo("conceptualConsistency", "7112", report.dqConceptualConsistency)
//            else if (report.dqCompletenessOmission != null) QualityInfo("", ", (report.) 
            else if (report.dqCompletenessCommission != null) QualityInfo("completenessComission", "7109", report.dqCompletenessCommission)
            else return null

        if (info.element.nameOfMeasure == null) return null
        
        val name = info.element.nameOfMeasure.map { it.value }.joinToString(";")
        val nameId = codeListService.getCodeListEntryId(info.codelist, name, "de")
        val nameKeyValue = if (nameId == null) KeyValue(null, name) else KeyValue(nameId)
        val parameter = info.element.measureDescription?.value
        val value = info.element.result?.dqQuantitativeResult?.value?.getOrNull(0)?.value?.toInt()
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
            }?: emptyList()
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

data class PositionalAccuracy(
    val vertical: Int?,
    val horizontal: Int?,
    val griddedDataPositionalAccuracy: Int?
)