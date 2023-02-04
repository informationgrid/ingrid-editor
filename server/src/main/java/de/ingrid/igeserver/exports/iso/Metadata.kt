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
    //@field:XmlElement(namespace = "http://www.isotc211.org/2005/gmd")
    var fileIdentifier: CharacterString? = null,
    var characterSet: CharacterSetCode? = null,
    var language: LanguageCode? = null,
    var parentIdentifier: CharacterString? = null,
    var hierarchyLevel: ScopeCode? = null,
    val hierarchyLevelName: CharacterString? = null,
    var contact: Contact? = null,
    var dateStamp: Date? = null,
    val metadataStandardName: CharacterString = CharacterString("ISO19119"),
    val metadataStandardVersion: CharacterString = CharacterString("2005/PDAM 1"),
    val dataSetURI: String? = null,
    val locale: String? = null,
    val spatialRepresentationInfo: String? = null,
    val referenceSystemInfo: ReferenceSystem? = null,
    val metadataExtensionInfo: String? = null,
    val identificationInfo: IdentificationInfo? = null,
    val contentInfo: String? = null,
    val distributionInfo: String? = null,
    val dataQualityInfo: String? = null,
    val portrayalCatalogueInfo: String? = null,
    val metadataConstraints: String? = null,
    val applicationSchemaInfo: String? = null,
    val metadataMaintenance: String? = null,
    val series: String? = null,
    val describes: String? = null,
    val propertyType: String? = null,
    val featureType: String? = null,
    val featureAttribute: String? = null) {

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
