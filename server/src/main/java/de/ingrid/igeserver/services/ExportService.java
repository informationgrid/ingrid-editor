package de.ingrid.igeserver.services;

import de.ingrid.igeserver.api.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.exports.ExporterFactory;
import de.ingrid.igeserver.exports.IgeExporter;
import de.ingrid.igeserver.services.ExportPostProcessors.TransformationType;

import java.io.IOException;

@Service
public class ExportService {

	@Autowired
	private ExporterFactory exporterFactory;
	
	@Autowired(required = false)
	private ExportPostProcessors[] postProcessors;

	public String doExport(JsonNode jsonData, String format) throws ApiException, IOException {

		Object exportedDoc = null;
		
		IgeExporter exporter = exporterFactory.getExporter(format);
		
		switch (format) {
		case "ISO":
		    // TODO: provide DB context
			exportedDoc = exporter.run(jsonData);
			
			// run post processors
			if (postProcessors != null) {
				for (ExportPostProcessors postProcessor : postProcessors) {
					if (postProcessor.getType() == TransformationType.ISO) {
						postProcessor.process(exportedDoc, jsonData);
					}
				}
			}
			break;
			
		default:
			throw new ApiException(500, "Export format not supported: " + format);
		}
		
		if (exportedDoc instanceof String) {
			return (String) exportedDoc;
		} else {
			return exporter.toString(exportedDoc);
		}
		
	}
}
