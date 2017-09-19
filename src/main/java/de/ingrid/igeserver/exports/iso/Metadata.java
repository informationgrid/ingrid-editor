package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;

@XmlRootElement(name = "MD_Metadata")
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(
		namespace="http://www.isotc211.org/2005/gmd",
		propOrder = { 
		"fileIdentifier", "language", "characterSet", "parentIdentifier" 
		})
public class Metadata {

	
	@XmlElement(name = "fileIdentifier")
	private CharacterString fileIdentifier;

	@XmlElement(name = "language")
	private LanguageCode language;

	@XmlElement(name = "characterSet")
	private CharacterSetCode characterSet;

	@XmlElement(name = "parentIdentifier")
	private CharacterString parentIdentifier;

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

}
