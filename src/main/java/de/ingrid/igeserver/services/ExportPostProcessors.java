package de.ingrid.igeserver.services;

import com.fasterxml.jackson.databind.JsonNode;

public interface ExportPostProcessors {
	
	public enum TransformationType {
		ISO
	}

	public Object process(Object exportedDoc, JsonNode jsonData);
	
	public TransformationType getType();
	
}
