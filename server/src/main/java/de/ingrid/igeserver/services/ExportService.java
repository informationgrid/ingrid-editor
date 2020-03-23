package de.ingrid.igeserver.services;

import de.ingrid.igeserver.api.ApiException;
import de.ingrid.igeserver.exports.ExportTypeInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.exports.ExporterFactory;
import de.ingrid.igeserver.exports.IgeExporter;

import java.io.IOException;
import java.util.List;

@Service
public class ExportService {

	@Autowired
	private ExporterFactory exporterFactory;
	
	@Autowired(required = false)
	private ExportPostProcessors[] postProcessors;

	public String doExport(JsonNode jsonData, String format) throws ApiException, IOException {

		Object exportedDoc;
		
		IgeExporter exporter = exporterFactory.getExporter(format);

		if (exporter == null) {
			throw new ApiException(500, "Export format not supported: " + format);
		}

		exportedDoc = exporter.run(jsonData);

		// run post processors
/*
		if (postProcessors != null) {
			for (ExportPostProcessors postProcessor : postProcessors) {
				if (postProcessor.getType() == TransformationType.ISO) {
					postProcessor.process(exportedDoc, jsonData);
				}
			}
		}
*/


		if (exportedDoc instanceof String) {
			return (String) exportedDoc;
		} else {
			return exporter.toString(exportedDoc);
		}
		
	}

	public List<ExportTypeInfo> getExportTypes() {
		return exporterFactory.getTypeInfos();
	}
}
