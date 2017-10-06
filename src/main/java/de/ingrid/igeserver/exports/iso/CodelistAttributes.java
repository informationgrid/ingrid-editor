package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlAttribute;
import javax.xml.bind.annotation.XmlValue;

public class CodelistAttributes {
	
    public CodelistAttributes() {}
    
	public CodelistAttributes(String codelist, String codelistValue) {
		this.codeList = codelist;
		this.codeListValue = codelistValue;
	}
	
	public CodelistAttributes(String codelist, String codelistValue, String content) {
		this.codeList = codelist;
		this.codeListValue = codelistValue;
		this.content = content;
	}
	
	@XmlAttribute(name="codeList")
	public String codeList;
	
	@XmlAttribute(name="codeListValue")
	public String codeListValue;
	
	@XmlValue
	public String content;
	
}