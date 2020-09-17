package de.ingrid.igeserver.exports

import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ExporterFactory @Autowired constructor(val exporterList: List<IgeExporter>) {
    val typeInfos: List<ExportTypeInfo>
        get() = exporterList
                .map { exporter: IgeExporter -> exporter.typeInfo }

    fun getExporter(format: String): IgeExporter {
        try {
            return exporterList.first { exporter: IgeExporter -> format == exporter.typeInfo.type }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("No exporter found for format '$format'.")
        }
    }
}