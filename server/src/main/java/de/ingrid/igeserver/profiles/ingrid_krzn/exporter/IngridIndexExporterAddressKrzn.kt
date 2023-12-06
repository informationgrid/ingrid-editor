package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service

@Service
class IngridIndexExporterAddressKrzn(
    idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.ADDRESS,
        "indexInGridIDFKrzn",
        "Ingrid IDF Address KRZN (Elasticsearch)",
        "Export von Ingrid Adressen ins IDF Format für KRZN für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("krzn"),
        false
    )

}
