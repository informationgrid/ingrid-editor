package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("uvp")
class IndexExporter @Autowired constructor(val idfExporter: IDFExporter, val luceneExporter: LuceneExporter): IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexUvpIDF",
        "UVP IDF (Elasticsearch)",
        "Export von UVP Verfahren ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("uvp"),
        false
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val idf = idfExporter.run(doc, catalogId)
        val luceneDoc = luceneExporter.run(doc, catalogId) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)
        luceneJson.put("idf", idf as String)
        return luceneJson.toPrettyString()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }
}
