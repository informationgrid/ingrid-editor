package de.ingrid.igeserver.exports;

import com.fasterxml.jackson.databind.JsonNode;

public interface IgeExporter {
	public Object run(JsonNode jsonData);
	
	public String toString(Object exportedObject);
}
