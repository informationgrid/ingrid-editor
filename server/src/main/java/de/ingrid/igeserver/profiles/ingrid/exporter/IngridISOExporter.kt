package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.XMLUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class IngridISOExporter @Autowired constructor(
    idfExporter: IngridIDFExporter,
    luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
            DocumentCategory.DATA,
            "ingridISO",
            "Ingrid ISO",
            "Export von Ingrid Dokumenten ISO Format für die Anzeige im Portal.",
            "text/xml",
            "xml",
            listOf("ingrid")
    )

    override fun run(doc: Document, catalogId: String): String {
        val indexString = super.run(doc, catalogId) as String
        val elasticDoc = jacksonObjectMapper().readValue<ElasticDocument>(indexString)
        val idfDoc = convertStringToDocument(elasticDoc["idf"] as String)
        val isoDoc = transformIDFtoIso(idfDoc!!)
        return XMLUtils.toString(isoDoc)
    }

}
