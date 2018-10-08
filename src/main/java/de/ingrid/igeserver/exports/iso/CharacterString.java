package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlElement;

public class CharacterString {
	
	@XmlElement(name="CharacterString", namespace="http://www.isotc211.org/2005/gco")
	public String text;

	public CharacterString() {}
	
	public CharacterString(String text) {
		this.text = text;
	}

}
