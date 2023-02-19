package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

//@XmlRootElement(name = "MD_Metadata", namespace = "http://www.isotc211.org/2005/gmd")
//@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
    //propOrder = ["fileIdentifier", "language", "characterSet", "parentIdentifier", "hierarchyLevel", "hierarchyLevelName", "contact", "dateStamp", "metadataStandardName", "metadataStandardVersion", "dataSetURI", "locale", "spatialRepresentationInfo", "referenceSystemInfo", "metadataExtensionInfo", "identificationInfo", "contentInfo", "distributionInfo", "dataQualityInfo", "portrayalCatalogueInfo", "metadataConstraints", "applicationSchemaInfo", "metadataMaintenance", "series", "describes", "propertyType", "featureType", "featureAttribute"]
)
data class Metadata(
    var fileIdentifier: CharacterString? = null,
    var characterSet: CharacterSetCode? = null,
    var language: LanguageCode? = null,
    var parentIdentifier: CharacterString? = null,
    var hierarchyLevel: List<ScopeCode>? = null,
    val hierarchyLevelName: List<CharacterString>? = null,
    var contact: List<Contact>,
    var dateStamp: Date,
    val metadataStandardName: CharacterString = CharacterString("ISO19119"),
    val metadataStandardVersion: CharacterString = CharacterString("2005/PDAM 1"),
    val dataSetURI: String? = null,
    val locale: List<String>? = null,
    val spatialRepresentationInfo: List<String>? = null,
    val referenceSystemInfo: List<ReferenceSystem>? = null,
    val metadataExtensionInfo: List<String>? = null,
    val identificationInfo: List<IdentificationInfo>,
    val contentInfo: List<ContentInfo>? = null,
    val distributionInfo: DistributionInfo? = null,
    val dataQualityInfo: List<DataQualityInfo>? = null,
    val portrayalCatalogueInfo: List<PortrayalCatalogueInfo>? = null,
    val metadataConstraints: List<String>? = null,
    val applicationSchemaInfo: List<String>? = null,
    val metadataMaintenance: String? = null,
    val series: List<String>? = null,
    val describes: List<String>? = null,
    val propertyType: List<String>? = null,
    val featureType: List<String>? = null,
    val featureAttribute: List<String>? = null) {

    /*fun setUuid(uuid: String?) {
        fileIdentifier = CharacterString(uuid)
    }*/

/*    val fieldIdentifier: String?
        get() = fileIdentifier!!.text*/

/*
    fun setLanguage(language: String) {
        this.language = LanguageCode().apply {
            codelist = CodelistAttributes(
                "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#LanguageCode",
                language,
                language
            )
        }
    }
*/

/*
    fun getLanguage(): String? {
        return language!!.codelist!!.content
    }
*/

/*
    fun setCharacterSet() {
        this.characterSet = CharacterSetCode()
        this.characterSet!!.characterSetCode = CodelistAttributes(
            "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode",
            "utf8"
        )
    }
*/

/*
    fun setParentIdentifier(parentUuid: String?) {
        parentIdentifier = CharacterString(parentUuid)
    }
*/

/*
    fun setHierarchyLevel(level: String?) {
        val scopeCode = ScopeCode()
        scopeCode.codelist = CodelistAttributes(
            "http://www.tc211.org/ISO19139/resources/codeList.xml#MD_ScopeCode",
            level,
            level
        )
        hierarchyLevel = scopeCode
    }
*/

/*    fun setContact(uuid: String?, role: String?) {
        contact = Contact()
        val responsibleParty = ResponsibleParty()
        responsibleParty.uuid = uuid
        *//*responsibleParty.setRole(
            CodelistAttributes(
                "http://www.tc211.org/ISO19139/resources/codeList.xml#CI_RoleCode",
                role
            )
        )*//*
        val ci = ContactInfo()
        ci.setAddress( "xxx@yyy.zz")
        responsibleParty.contactInfo = ci
        contact!!.responsibleParty = responsibleParty
    }*/

//    fun setDateStamp(date: String?) {
//        dateStamp = Date(date)
//    }
}

data class DistributionInfo(
    @JacksonXmlProperty(localName = "MD_Distribution") val mdDistribution: MDDistribution?
)

data class MDDistribution(
    val distributionFormat: List<DistributionFormat>?,
    val distributor: List<Distributor>?,
    val transferOptions: List<TransferOption>?
)

data class DistributionFormat(
    @JacksonXmlProperty(localName = "MD_Format") val format: MDFormat?
)

data class MDFormat(
    val name : CharacterString,
    val version : CharacterString,
    val amendmentNumber : CharacterString?,
    val specification : CharacterString?,
    val fileDecompressionTechnique : CharacterString?,
    val formatDistributor : List<CharacterString>?
)

data class Distributor(
    @JacksonXmlProperty(localName = "MD_Distributor") val mdDistributor: MDDistributor 
)

data class MDDistributor(
    val distributorContact: Contact,
    val distributionOrderProcess: List<DistributionOrderProcess>?,
    val distributorFormat: List<CharacterString>?,
    val distributorTransferOptions: List<CharacterString>?,
)

data class DistributionOrderProcess(
    @JacksonXmlProperty(localName = "MD_StandardOrderProcess") val mdStandardOrderProcess: MDStandardOrderProcess?
)

data class MDStandardOrderProcess(
    val fees: CharacterString?,
    val plannedAvailableDateTime: CharacterString?,
    val orderingInstructions: CharacterString?,
    val turnaround: CharacterString?
)

data class TransferOption(
    @JacksonXmlProperty(localName = "MD_DigitalTransferOptions") val mdDigitalTransferOptions: MDDigitalTransferOptions?
)

data class MDDigitalTransferOptions(
    val unitsOfDistribution: CharacterString?,
    val transferSize: Real?,
    val onLine: List<Online>?,
    val offLine: Offline?
)

data class Online(
    @JacksonXmlProperty(localName = "CI_OnlineResource") val ciOnlineResource: CIOnlineResource?
)

data class Offline(
    @JacksonXmlProperty(localName = "MD_Medium") val mdMedium: MDMedium?
)

data class MDMedium(
    val name: MDMediumNameCode?,
    val density: List<CharacterString>?,
    val densityUnits: CharacterString?,
    val volumes: CharacterString?,
    val mediumFormat: List<CharacterString>?,
    val mediumNote: CharacterString?
)

data class MDMediumNameCode(
    @JacksonXmlProperty(localName = "MD_MediumNameCode") val code: CodelistAttributes?
)

data class DataQualityInfo(
    @JacksonXmlProperty(localName = "DQ_DataQuality") val dqDataQuality: DQDataQuality?
)

data class DQDataQuality(
    val scope: Scope,
    val report: List<DQReport>?,
    val lineage: Lineage?
)

data class Lineage(
    @JacksonXmlProperty(localName = "LI_Lineage") val liLinage: LILinage?
)

data class LILinage(
    val statement: CharacterString?,
    val processStep: List<ProcessStep>?,
    val source: List<Source>?
)

data class ProcessStep(
    @JacksonXmlProperty(localName = "LI_ProcessStep") val liProcessStep: LIProcessStep
)

data class LIProcessStep(
    val description: CharacterString
)

data class Source(
    @JacksonXmlProperty(localName = "LI_Source") val liSource: LISource?
)

data class LISource(
    val description: CharacterString?
)

data class DQReport(
    @JacksonXmlProperty(localName = "DQ_TemporalValidity") val dqTemporalValidity: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_TemporalConsistency") val dqTemporalConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_AccuracyOfATimeMeasurement") val dqAccuracyOfATimeMeasurement: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_QuantitativeAttributeAccuracy") val dqQuantitativeAttributeAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_NonQuantitativeAttributeAccuracy") val dqNonQuantitativeAttributeAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_ThematicClassificationCorrectness") val dqThematicClassificationCorrectness: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_RelativeInternalPositionalAccuracy") val dqRelativeInternalPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_GriddedDataPositionalAccuracy") val dqGriddedDataPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_AbsoluteExternalPositionalAccuracy") val dqAbsoluteExternalPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_TopologicalConsistency") val dqTopologicalConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_FormatConsistency") val dqFormatConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_DomainConsistency") val dqDomainConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_ConceptualConsistency") val dqConceptualConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_CompletenessOmission") val dqCompletenessOmission: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_CompletenessCommission") val dqCompletenessCommission: DQReportElement?,
)

data class DQReportElement(
    val nameOfMeasure: List<CharacterString>?,
    val measureIdentification: CharacterString?,
    val measureDescription: CharacterString?,
    val evaluationMethodType: CharacterString?,
    val evaluationMethodDescription: CharacterString?,
    val evaluationProcedure: CharacterString?,
    val dateTime: List<CharacterString>?,
    val result: DQResult? // [1..2]
)

data class DQResult(
    @JacksonXmlProperty(localName = "DQ_ConformanceResult") val dqConformanceResult: DQConformanceResult?,
    @JacksonXmlProperty(localName = "DQ_QuantitativeResult") val dqQuantitativeResult: DQQuantitativeResult?
)

data class DQQuantitativeResult(
    val valueType: ValueType?,
    val valueUnit: ValueUnit,
    val errorStatistic: CharacterString?,
    val value: List<Record>
)

data class ValueUnit(
    @JacksonXmlProperty(localName = "UnitDefinition") val unitDefinition: UnitDefinition?
)

data class UnitDefinition(
    val name: String?,
    val quantityType: String?,
    val catalogSymbol: String?
)

data class Record(
    @JacksonXmlProperty(localName = "Record") val value: String?
)

data class ValueType(
    @JacksonXmlProperty(localName = "RecordType") val recordType: String?
)

data class DQConformanceResult(
    val specification: Citation,
    val explanation: CharacterString,
    val pass: MDBoolean
)

data class MDBoolean(
    @JacksonXmlProperty(localName = "Boolean") val boolean: BooleanValue?
)

data class BooleanValue(
    @JacksonXmlProperty(isAttribute = true) var nilReason: String? = null,
) {
    @JacksonXmlText
    val value: Boolean? = null
}

data class Scope(
    @JacksonXmlProperty(localName = "DQ_Scope") val dqScope: DQScope?
)

data class DQScope(
    val level: ScopeCode,
    val extent: EXExtentOrig?,
    val levelDescription: List<ScopeDescription>?,
)

data class ScopeDescription(
    @JacksonXmlProperty(localName = "MD_ScopeDescription") val mdScopeDescription: MDScopeDescription?
)

data class MDScopeDescription(
    val attributes: List<CharacterString>?,
    val features: List<CharacterString>?,
    val featureInstances: List<CharacterString>?,
    val attributeInstances: List<CharacterString>?,
    val dataset: CharacterString?,
    val other: CharacterString?
)

data class PortrayalCatalogueInfo(
    @JacksonXmlProperty(localName = "MD_PortrayalCatalogueReference") val mdPortrayalCatalogueInfo: MDPortrayalCatalogueInfo?
)

data class MDPortrayalCatalogueInfo(
    val portrayalCatalogueCitation: List<Citation>
)
data class ContentInfo(
    @JacksonXmlProperty(localName = "MD_FeatureCatalogueDescription") val mdFeatureCatalogueDescription: MDFeatureCatalogueDescription?
)

data class MDFeatureCatalogueDescription(
    val complianceCode: CharacterString?,
    val language: List<CharacterString>?,
    val includedWithDataset: CharacterString,
    val featureTypes: List<LocalName>?,
    val featureCatalogueCitation: List<Citation>
)