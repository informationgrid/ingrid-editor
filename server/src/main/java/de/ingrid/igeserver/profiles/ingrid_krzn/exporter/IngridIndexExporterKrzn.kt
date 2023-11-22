package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class IngridIndexExporterKrzn(
    @Qualifier("ingridIDFExporter") idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
    krznProfileTransformer: KrznProfileTransformer
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    private val typeId = "indexInGridIDFKrzn"

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        typeId,
        "Ingrid IDF KRZN (Elasticsearch)",
        "Export von Ingrid Dokumenten ins IDF Format für KRZN für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("krzn"),
        false
    )
    
    init {
        idfExporter.profileTransformer = krznProfileTransformer
        luceneExporter.profileTransformer = krznProfileTransformer
    }

}
