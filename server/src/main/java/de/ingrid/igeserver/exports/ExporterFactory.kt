package de.ingrid.igeserver.exports

import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ExporterFactory(private val exporterList: List<IgeExporter>) {
    val typeInfos: List<ExportTypeInfo> = exporterList.map { exporter: IgeExporter -> exporter.typeInfo }

    fun getExporter(category: DocumentCategory, format: String): IgeExporter {
        try {
            return exporterList.first { exporter: IgeExporter -> category == exporter.typeInfo.category && format == exporter.typeInfo.type }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("No exporter found for format '$format'.")
        }
    }
}