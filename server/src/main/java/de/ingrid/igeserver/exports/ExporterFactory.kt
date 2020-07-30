package de.ingrid.igeserver.exports

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.stream.Collectors

@Service
class ExporterFactory @Autowired constructor(val exporterList: List<IgeExporter>) {
    val typeInfos: List<ExportTypeInfo>
        get() = exporterList
                .map { exporter: IgeExporter -> exporter.typeInfo }

    fun getExporter(format: String): IgeExporter {
        return exporterList.first { exporter: IgeExporter -> format == exporter.typeInfo.type }
    }

}