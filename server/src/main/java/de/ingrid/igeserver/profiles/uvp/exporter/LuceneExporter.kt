package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.springframework.stereotype.Service

@Service
class LuceneExporter {

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = XMLStringOutput()
        templateEngine.render("uvp/template-lucene.jte", getMapFromObject(doc)["model"], output)
        return output.toString()
    }

    private fun getMapFromObject(json: Document): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf("model" to mapper.convertValue(json, UVPModel::class.java))

    }

    private class XMLStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                StringEscapeUtils.escapeXml11(value)
                    .replace("\n", "&#10;")
                    .replace("\r", "&#13;")
                    .replace("\t", "&#9;")
            )
        }
    }
}
