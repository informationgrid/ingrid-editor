package de.ingrid.igeserver.exports.iso

import javax.xml.bind.annotation.XmlAccessType
import javax.xml.bind.annotation.XmlAccessorType
import javax.xml.bind.annotation.XmlRootElement
import javax.xml.bind.annotation.XmlType

@XmlRootElement(name = "MD_Metadata")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(
    namespace = "http://www.isotc211.org/2005/gmd",
    propOrder = ["fileIdentifier", "language", "characterSet", "parentIdentifier", "hierarchyLevel", "hierarchyLevelName", "contact", "dateStamp", "metadataStandardName", "metadataStandardVersion", "dataSetURI", "locale", "spatialRepresentationInfo", "referenceSystemInfo", "metadataExtensionInfo", "identificationInfo", "contentInfo", "distributionInfo", "dataQualityInfo", "portrayalCatalogueInfo", "metadataConstraints", "applicationSchemaInfo", "metadataMaintenance", "series", "describes", "propertyType", "featureType", "featureAttribute"]
)
class Metadata {
    private var fileIdentifier: CharacterString? = null
    private var characterSet: CharacterSetCode? = null
    var language: LanguageCode? = null
    private var parentIdentifier: CharacterString? = null
    private var hierarchyLevel: ScopeCode? = null
    private val hierarchyLevelName: String? = null
    private var contact: Contact? = null
    private var dateStamp: Date? = null
    private val metadataStandardName: CharacterString
    private val metadataStandardVersion: CharacterString
    private val dataSetURI: String? = null
    private val locale: String? = null
    private val spatialRepresentationInfo: String? = null
    private val referenceSystemInfo: String? = null
    private val metadataExtensionInfo: String? = null
    private val identificationInfo: String? = null
    private val contentInfo: String? = null
    private val distributionInfo: String? = null
    private val dataQualityInfo: String? = null
    private val portrayalCatalogueInfo: String? = null
    private val metadataConstraints: String? = null
    private val applicationSchemaInfo: String? = null
    private val metadataMaintenance: String? = null
    private val series: String? = null
    private val describes: String? = null
    private val propertyType: String? = null
    private val featureType: String? = null
    private val featureAttribute: String? = null
    fun setUuid(uuid: String?) {
        fileIdentifier = CharacterString(uuid)
    }

    val fieldIdentifier: String?
        get() = fileIdentifier!!.text

    fun setLanguage(language: String) {
        this.language = LanguageCode().apply {
            codelist = CodelistAttributes(
                "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#LanguageCode",
                language,
                language
            )
        }
    }

    fun getLanguage(): String? {
        return language!!.codelist!!.content
    }

    fun setCharacterSet(characterSet: String?) {
        this.characterSet = CharacterSetCode()
        this.characterSet!!.characterSetCode = CodelistAttributes(
            "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode",
            "utf8"
        )
    }

    fun setParentIdentifier(parentUuid: String?) {
        parentIdentifier = CharacterString(parentUuid)
    }

    fun setHierarchyLevel(level: String?) {
        val scopeCode = ScopeCode()
        scopeCode.codelist = CodelistAttributes(
            "http://www.tc211.org/ISO19139/resources/codeList.xml#MD_ScopeCode",
            level,
            level
        )
        hierarchyLevel = scopeCode
    }

    fun setContact(uuid: String?, role: String?) {
        contact = Contact()
        val responsibleParty = ResponsibleParty()
        responsibleParty.uuid = uuid
        responsibleParty.setRole(
            CodelistAttributes(
                "http://www.tc211.org/ISO19139/resources/codeList.xml#CI_RoleCode",
                role
            )
        )
        val ci = ContactInfo()
        ci.setAddress(ContactType.ADDRESS, "xxx@yyy.zz")
        responsibleParty.contactInfo = ci
        contact!!.responsibleParty = responsibleParty
    }

    fun setDateStamp(date: String?) {
        dateStamp = Date(date)
    }

    init {
        metadataStandardName = CharacterString("ISO19119")
        metadataStandardVersion = CharacterString("2005/PDAM 1")
    }
}
