package de.ingrid.igeserver.profiles.uvp.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("uvp")
class IndexExporterAddress @Autowired constructor(
) : IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.ADDRESS,
        "indexUvpIDF",
        "UVP IDF Address (Elasticsearch)",
        "Export von UVP Adressen ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format. Für UVP allerdings leer und nur für Auflistung im Portal unter 'Verfahrensführende Behörden' benötigt.",
        "application/json",
        "json",
        listOf("uvp")
    )

    override fun run(doc: Document, catalogId: String): Any {
        return """{
            "iPlugId": "ige-ng_${catalogId}",
            "dataSourceName": "iPlug IGE-NG (${catalogId})",
            "partner": [],
            "provider": [],
            "t02_address.typ": 0,
            "datatype": [
                "default",
                "dsc_ecs",
                "metadata",
                "dsc_ecs_address",
                "address",
                "IDF_1.0"
            ]
        }""".trimMargin()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }
}
