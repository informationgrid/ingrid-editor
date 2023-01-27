package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.iso19115.Iso19115Exporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.matchers.string.shouldContain

class IsoExport : AnnotationSpec() {
    private lateinit var exporter: Iso19115Exporter

    @Before
    fun init() {
        exporter = Iso19115Exporter()
    }

    @Test
    fun normalExport() {
        val doc = Document().apply {
            title = "Test Export 1"
            data = jacksonObjectMapper().createObjectNode().apply {
                put("description", "This is the description of the exported document")
            }
        }
        val result = (exporter.run(doc, "test") as String).replace("\n\\s+".toRegex(), "")
        result shouldContain "<gmd:title>" +
                "<gco:CharacterString>Test Export 1</gco:CharacterString>" +
                "</gmd:title>"

        result shouldContain "<gmd:abstract>" +
                "<gco:CharacterString>This is the description of the exported document</gco:CharacterString>" +
                "</gmd:abstract>"
    }

    @Test
    fun anchorLink() {
        val json = "[{ \"name\": \"test-keyword 1\", \"link\": \"http://abc.de/xyz\"}]"
        val jsonNode = ObjectMapper().readTree(json)
        val doc = Document().apply {
            title = "Test Export 1"
            data = jacksonObjectMapper().createObjectNode().apply {
                set<JsonNode>("keywords", jsonNode)
            }
        }
        val result = (exporter.run(doc, "test") as String).replace("\n\\s+".toRegex(), "")

        result shouldContain "<gmx:Anchor xlink:href=\"http://abc.de/xyz\">test-keyword 1</gmx:Anchor>"
        result shouldContain "<gmd:title><gco:CharacterString>Mein Thesaurus</gco:CharacterString></gmd:title>"
        result shouldContain "<gco:Date>10.10.1978</gco:Date>"
    }
}
