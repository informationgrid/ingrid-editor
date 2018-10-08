package de.ingrid.igeserver.exports.iso;

import java.io.StringWriter;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.exports.IgeExporter;

public class IsoExporter implements IgeExporter {

	@Override
	public Object run(JsonNode jsonData) {

		return mapMetadata(jsonData);
			
	}

	private Metadata mapMetadata(JsonNode tree) {

		Metadata md = new Metadata();
		md.setUuid(tree.path("_id").asText());
		md.setLanguage(tree.path("metadataLanguage").path("value").asText());
		md.setCharacterSet(tree.path("").asText());
		md.setParentIdentifier(tree.path("_parent").asText(null));
		md.setHierarchyLevel("dataset");
		md.setContact("12345", "pointOfContact");
		md.setDateStamp( "1978-10-10" );
		return md;
	}

	@Override
	public String toString(Object exportedObject) {
		StringWriter stringWriter = new StringWriter();
		try {
			JAXBContext context = JAXBContext.newInstance(Metadata.class);
			Marshaller marshaller = context.createMarshaller();
			marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);
			marshaller.marshal(exportedObject, System.out);
			marshaller.marshal(exportedObject, stringWriter);
		} catch (JAXBException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return stringWriter.toString();
	}

}
