package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlElement;

public class Contact {
	
	@XmlElement(name = "CI_ResponsibleParty")
	public ResponsibleParty responsibleParty; 
	
}
