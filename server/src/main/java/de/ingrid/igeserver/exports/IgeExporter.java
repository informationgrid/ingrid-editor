package de.ingrid.igeserver.exports;

import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;

public interface IgeExporter {
	ExportTypeInfo getTypeInfo();

	Object run(JsonNode jsonData) throws IOException;
	
	String toString(Object exportedObject);
}
