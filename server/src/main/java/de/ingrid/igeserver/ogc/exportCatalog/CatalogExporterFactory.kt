package de.ingrid.igeserver.ogc.exportCatalog

import de.ingrid.igeserver.api.CollectionFormat
import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ogc-api")
class OgcCatalogExporterFactory(private val catalogExporterList: List<OgcCatalogExporter>) {
    val typeInfos: List<CatalogExportTypeInfo> = catalogExporterList.map { exporter: OgcCatalogExporter -> exporter.typeInfo }

    fun getExporter(format: CollectionFormat): OgcCatalogExporter {
        try {
            return catalogExporterList.first { exporter: OgcCatalogExporter -> format.toString() == exporter.typeInfo.type }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("No exporter found for format '$format'.")
        }
    }
}