package de.ingrid.igeserver.exports;

import com.fasterxml.jackson.databind.JsonNode;

public interface IgeExporter {
	Object run(JsonNode jsonData);
	
	String toString(Object exportedObject);
}
