@XmlSchema( 
    namespace = "http://www.isotc211.org/2005/gmd",
	xmlns = {
	        @XmlNs(prefix="gmd", namespaceURI="http://www.isotc211.org/2005/gmd"),
	        @XmlNs(prefix="gco", namespaceURI="http://www.isotc211.org/2005/gco")
	    },
    elementFormDefault = XmlNsForm.QUALIFIED) 
package de.ingrid.igeserver.exports.iso;

import javax.xml.bind.annotation.XmlNs;
import javax.xml.bind.annotation.XmlNsForm;
import javax.xml.bind.annotation.XmlSchema;