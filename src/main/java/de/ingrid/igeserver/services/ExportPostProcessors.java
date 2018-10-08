package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;

public interface ExportPostProcessors {
	
	enum TransformationType {
		ISO
	}

	Object process(Object exportedDoc, JsonNode jsonData);
	
	TransformationType getType();
	
}
