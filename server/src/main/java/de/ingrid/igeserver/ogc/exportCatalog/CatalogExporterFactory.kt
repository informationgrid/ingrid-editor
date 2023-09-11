package de.ingrid.igeserver.ogc.exportCatalog

import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class OgcCatalogExporterFactory @Autowired constructor(private val catalogExporterList: List<OgcCatalogExporter>) {
    val typeInfos: List<CatalogExportTypeInfo> = catalogExporterList.map { exporter: OgcCatalogExporter -> exporter.typeInfo }

    fun getExporter(format: String): OgcCatalogExporter {
        try {
            return catalogExporterList.first { exporter: OgcCatalogExporter -> format == exporter.typeInfo.type }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("No exporter found for format '$format'.")
        }
    }
}