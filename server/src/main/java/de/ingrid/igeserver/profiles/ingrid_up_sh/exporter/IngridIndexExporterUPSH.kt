package de.ingrid.igeserver.profiles.ingrid_up_sh.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service

@Service
class IngridIndexExporterUPSH(
    idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
    UPSHProfileTransformer: UPSHProfileTransformer
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDFUPSH",
        "Ingrid IDF UP-SH (Elasticsearch)",
        "Export von Ingrid Dokumenten ins IDF Format für UP-SH für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid-up-sh"),
        false
    )

    init {
        idfExporter.profileTransformer = UPSHProfileTransformer
        luceneExporter.profileTransformer = UPSHProfileTransformer
    }

}
