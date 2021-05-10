package de.ingrid.igeserver.services

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

    fun getExporter(category: DocumentCategory, format: String): IgeExporter = exporterFactory.getExporter(category, format)
    
    fun getExportTypes(profile: String): List<ExportTypeInfo> {
        return exporterFactory.typeInfos
                .filter { it.profiles.isEmpty() || it.profiles.contains(profile) }
    }
}