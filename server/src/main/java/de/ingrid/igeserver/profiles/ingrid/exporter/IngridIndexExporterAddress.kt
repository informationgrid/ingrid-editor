package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class IngridIndexExporterAddress  @Autowired constructor(
    @Qualifier("ingridIDFExporter") idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository
) : IngridIndexExporter( idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.ADDRESS,
        "indexInGridIDF",
        "Ingrid IDF Address (Elasticsearch)",
        "Export von Ingrid Adressen ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid"),
        false
    )

}
