package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.Config
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class IngridIndexExporterAddress  @Autowired constructor(
    @Qualifier("ingridIDFExporter") idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
) : IngridIndexExporter( idfExporter, luceneExporter, documentWrapperRepository, codelistHandler, config, catalogService) {

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
