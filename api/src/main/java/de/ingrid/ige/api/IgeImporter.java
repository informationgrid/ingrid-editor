package de.ingrid.ige.api;

import com.fasterxml.jackson.databind.JsonNode;

public interface IgeImporter {

	public JsonNode run(Object data);
}
