package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("uvp")
class IndexExporter : IDFExporter(), IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexUvpIDF",
        "UVP IDF (Elasticsearch)",
        "Export von UVP Verfahren ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("uvp")
    )

    override fun run(doc: Document, catalogId: String): Any {
        val idf = super.run(doc, catalogId)
        return jacksonObjectMapper().createObjectNode().apply {
            put("idf", idf as String)
        }.toString()
    }
}
