package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@XmlRootElement(name = "MD_Metadata")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(
		namespace="http://www.isotc211.org/2005/gmd",
		propOrder = { 
		"fileIdentifier", "language", "characterSet", "parentIdentifier", "hierarchyLevel",
		"contact", "dateStamp", "metadataStandardName", "referenceSystemInfo", "identificationInfo"
		})
public class Metadata {

	private CharacterString fileIdentifier;

	private LanguageCode language;

	private CharacterSetCode characterSet;

	private CharacterString parentIdentifier;
	
	private ScopeCode hierarchyLevel;
	
	private Contact contact;
	
	private String dateStamp;
	private String metadataStandardName;
	private String referenceSystemInfo;
	private String identificationInfo;

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
		
		this.contact.responsibleParty = responsibleParty;
	}

}
