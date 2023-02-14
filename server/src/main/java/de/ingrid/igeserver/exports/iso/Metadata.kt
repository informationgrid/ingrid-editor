package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement
import javax.xml.bind.annotation.*

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
    val contentInfo: List<String>? = null,
    val distributionInfo: DistributionInfo? = null,
    val dataQualityInfo: List<String>? = null,
    val portrayalCatalogueInfo: List<String>? = null,
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