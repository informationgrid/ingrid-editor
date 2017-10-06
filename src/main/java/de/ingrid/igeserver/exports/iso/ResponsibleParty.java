package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlElement;

public class ResponsibleParty {
	
	@XmlAttribute
	public String uuid;

	private String individualName;
	
	private String organisationName;
	
	private String positionName;
	
	@XmlElement(name = "CI_Contact")
	public ContactInfo contactInfo;
	
	@XmlElement(name = "role")
	private RoleCode role;

	public void setRole(CodelistAttributes codelistAttr) {
		this.role = new RoleCode();
		this.role.codelist = codelistAttr;
	}

}
