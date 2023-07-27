package de.ingrid.igeserver.profiles.bmi.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.exporter.model.BmiModel
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer

@Service
@Profile("bmi")
class BmiIndexExporter : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.DATA,
                "index",
                "BMI Index",
                "Export der Adressen für die weitere Verwendung im  Exporter.",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("bmi")
            )
        }

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val engine = PebbleEngine.Builder()
            .defaultEscapingStrategy("json")
            //.newLineTrimming(false)
            .build()

        // TODO: should we handle export of addresses here too, instead of having another class
        //       Then we don't need to define info in ExportTypeInfo!
        val compiledTemplate = engine.getTemplate("templates/export/bmi/index.peb")

        val writer: Writer = StringWriter()
        val map = getMapFromObject(doc, catalogId)
        compiledTemplate.evaluate(writer, map)
        return writer.toString()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> {

        return mapOf(
            "model" to jacksonObjectMapper().convertValue(json, BmiModel::class.java),
            "catalogId" to catalogId
        )

    }
}
