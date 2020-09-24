package de.ingrid.igeserver.profiles.mcloud.exporter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.profiles.mcloud.exporter.model.MCloudModel
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer

@Service
@Profile("mcloud")
class DcatApExporter : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                    "mcloudDcat",
                    "mCLOUD DCAT-AP.de",
                    "Export von mCLOUD Datensätzen ins DCAT-AP.de Format.",
                    "text/xml",
                    "xml",
                    listOf("mcloud"))
        }

    override fun run(jsonData: JsonNode): Any {
        val engine = PebbleEngine.Builder()
                .newLineTrimming(false)
                .build()

        val compiledTemplate = engine.getTemplate("templates/export/mcloud/dcat.peb")

        val writer: Writer = StringWriter()
        val map = getMapFromObject(jsonData)
        compiledTemplate.evaluate(writer, map)
        return writer.toString().replace("\\s+\n".toRegex(), "\n")
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: JsonNode): Map<String, Any> {

        return mapOf("model" to jacksonObjectMapper().convertValue(json, MCloudModel::class.java))

    }
}