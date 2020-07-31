package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.exports.IgeExporter
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ExportService {
    @Autowired
    private lateinit var exporterFactory: ExporterFactory

    @Autowired(required = false)
    private lateinit var postProcessors: Array<ExportPostProcessors>

    fun getExporter(format: String): IgeExporter = exporterFactory.getExporter(format)

    @Deprecated("Use getExporter instead and call run method there")
    fun doExport(jsonData: JsonNode, format: String): String? {
        val exportedDoc: Any?
        val exporter = exporterFactory.getExporter(format)
                ?: throw ApiException(500, "Export format not supported: $format")
        exportedDoc = exporter.run(jsonData)

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
        return if (exportedDoc is String) {
            exportedDoc
        } else {
            exporter.toString(exportedDoc)
        }
    }

    fun getExportTypes(profile: String): List<ExportTypeInfo> {
        return exporterFactory.typeInfos
                .filter { it.profiles.isEmpty() || it.profiles.contains(profile) }
    }
}