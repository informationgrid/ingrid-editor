package de.ingrid.igeserver.imports;

import com.fasterxml.jackson.databind.JsonNode;

public interface IgeImporter {

	public JsonNode run(Object data);
}
