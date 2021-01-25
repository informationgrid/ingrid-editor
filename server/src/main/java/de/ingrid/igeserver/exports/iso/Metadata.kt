package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@SuppressWarnings("unused")
@XmlRootElement(name = "MD_Metadata")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(
		namespace="http://www.isotc211.org/2005/gmd",
		propOrder = { 
		"fileIdentifier", "language", "characterSet", "parentIdentifier", "hierarchyLevel", "hierarchyLevelName",
		"contact", "dateStamp", "metadataStandardName", "metadataStandardVersion", "dataSetURI", "locale",
		"spatialRepresentationInfo", "referenceSystemInfo", "metadataExtensionInfo", "identificationInfo",
		"contentInfo", "distributionInfo", "dataQualityInfo", "portrayalCatalogueInfo", "metadataConstraints",
		"applicationSchemaInfo", "metadataMaintenance", "series", "describes", "propertyType", "featureType",
		"featureAttribute" 
		})
public class Metadata {

	private CharacterString fileIdentifier;

	private LanguageCode language;

	private CharacterSetCode characterSet;

	private CharacterString parentIdentifier;
	
	private ScopeCode hierarchyLevel;
	
	private String hierarchyLevelName;
	
	private Contact contact;
	
	private Date dateStamp;
	
	private CharacterString metadataStandardName;
	
	private CharacterString metadataStandardVersion;
	private String dataSetURI;
	private String locale;
	private String spatialRepresentationInfo;
	private String referenceSystemInfo;
	private String metadataExtensionInfo;
	
	private String identificationInfo;
	private String contentInfo;
	private String distributionInfo;
	private String dataQualityInfo;
	private String portrayalCatalogueInfo;
	private String metadataConstraints;
	private String applicationSchemaInfo;
	private String metadataMaintenance;
	private String series;
	private String describes;
	private String propertyType;
	private String featureType;
	private String featureAttribute;
	
	
	public Metadata() {
	    this.metadataStandardName = new CharacterString( "ISO19119" );
	    this.metadataStandardVersion = new CharacterString( "2005/PDAM 1" );
	}
	

	public void setUuid(String uuid) {
		this.fileIdentifier = new CharacterString(uuid);

	}
	
	public String getFieldIdentifier() {
		return fileIdentifier.text;
	}

	public void setLanguage(String language) {
		this.language = new LanguageCode();
		this.language.codelist = new CodelistAttributes(
				"http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#LanguageCode", 
				language,
				language);
	}
	
	public String getLanguage() {
		return language.codelist.content;
	}

	public void setCharacterSet(String characterSet) {
		this.characterSet = new CharacterSetCode();
		this.characterSet.characterSetCode = new CodelistAttributes(
				"http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode",
				"utf8");
	}

	public void setParentIdentifier(String parentUuid) {
		this.parentIdentifier = new CharacterString(parentUuid);

	}
	
	public void setHierarchyLevel(String level) {
		ScopeCode scopeCode = new ScopeCode();
		scopeCode.codelist = new CodelistAttributes(
				"http://www.tc211.org/ISO19139/resources/codeList.xml#MD_ScopeCode", 
				level, 
				level);
		this.hierarchyLevel = scopeCode;
	}
	
	public void setContact(String uuid, String role) {
		this.contact = new Contact();
		
		ResponsibleParty responsibleParty = new ResponsibleParty();
		responsibleParty.uuid = uuid;
		responsibleParty.setRole(new CodelistAttributes(
				"http://www.tc211.org/ISO19139/resources/codeList.xml#CI_RoleCode", 
				role));
		
		ContactInfo ci = new ContactInfo();
		ci.setAddress( ContactType.ADDRESS, "xxx@yyy.zz" );
		responsibleParty.contactInfo = ci;
		
		this.contact.responsibleParty = responsibleParty;
	}

	public void setDateStamp(String date) {
	    this.dateStamp = new Date(date);
	}
}
