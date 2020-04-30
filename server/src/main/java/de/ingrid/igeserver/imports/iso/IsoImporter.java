package de.ingrid.igeserver.imports.iso;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.ige.api.IgeImporter;
import de.ingrid.igeserver.exports.iso.Metadata;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.StringReader;

public class IsoImporter implements IgeImporter {

	@Override
	public JsonNode run(Object data) {
		
		// input is XML
		JAXBContext context;
		try {
			context = JAXBContext.newInstance(Metadata.class);
			Unmarshaller unmarshaller = context.createUnmarshaller();
			StringReader reader = new StringReader((String) data);
			Metadata md = (Metadata) unmarshaller.unmarshal(reader);
			
			JsonNode json = mapToJson(md);
			return json;
		} catch (JAXBException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	@Override
	public boolean canHandleImportFile(String contentType, String fileContent) {
		if ("text/xml".equals(contentType)) {
			return true;
		}
		return false;
	}

	@Override
	public String getName() {
		return "ISO";
	}

	private JsonNode mapToJson(Metadata md) {

		ObjectMapper mapper = new ObjectMapper();
		ObjectNode node = mapper.createObjectNode();
		
		node.put("_id", md.getFieldIdentifier());
		node.put("metadataLanguage", md.getLanguage());
		
		return node;
	}

}
