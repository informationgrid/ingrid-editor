package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class IngridIndexExporter @Autowired constructor(
    @Qualifier("ingridIDFExporter") val idfExporter: IngridIDFExporter,
    val luceneExporter: IngridLuceneExporter
) : IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDF",
        "Ingrid IDF (Elasticsearch)",
        "Export von Ingrid Dokumenten ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid")
    )

    override fun run(doc: Document, catalogId: String): Any {
        val idf = idfExporter.run(doc, catalogId)
        val luceneDoc = luceneExporter.run(doc, catalogId) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)
        luceneJson.put("idf", idf)
        return luceneJson.toPrettyString()
    }

}
