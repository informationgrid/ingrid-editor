package de.ingrid.igeserver.profiles.ingrid_with_opendata.exporter

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.opendata.exporter.OpenDataExporter
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class InGridExporterOpenDataInGrid(
    @Qualifier("ingridIndexExporter") val ingridExporter: IngridIndexExporter,
    val openDataExporter: OpenDataExporter,
) : IgeExporter {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFOpenInGrid",
            "InGrid IDF OpenData + InGrid (Elasticsearch)",
            "Export von InGrid und OpenData Dokumenten ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-with-opendata"),
            isPublic = true,
            useForPublish = true,
        )

    override fun run(
        doc: Document,
        catalogId: String,
        options: ExportOptions,
    ): Any = if (doc.type == "OpenDataDoc") {
        openDataExporter.run(doc, catalogId, options)
    } else {
        ingridExporter.run(doc, catalogId, options)
    }
}
