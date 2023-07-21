package de.ingrid.igeserver.profiles.mcloud.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.mcloud.exporter.model.MCloudModel
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer

@Service
@Profile("mcloud")
class DcatApExporter : IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "mcloudDcat",
        "mCLOUD DCAT-AP.de",
        "Export von mCLOUD Datensätzen ins DCAT-AP.de Format.",
        "text/xml",
        "xml",
        listOf("mcloud")
    )


    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val engine = PebbleEngine.Builder()
            .newLineTrimming(false)
            .build()

        val compiledTemplate = engine.getTemplate("templates/export/mcloud/dcat.peb")

        val writer: Writer = StringWriter()
        val map = getMapFromObject(doc)
        compiledTemplate.evaluate(writer, map)
        return writer.toString().replace("\\s+\n".toRegex(), "\n")
    }

    private fun getMapFromObject(json: Document): Map<String, Any> {

        return mapOf("model" to jacksonObjectMapper().convertValue(json, MCloudModel::class.java))

    }
}
