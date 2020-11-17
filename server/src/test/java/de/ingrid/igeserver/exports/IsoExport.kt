package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.exports.iso19115.Iso19115Exporter
import io.kotest.core.spec.style.AnnotationSpec
import org.hamcrest.CoreMatchers
import org.hamcrest.MatcherAssert.assertThat

class IsoExport : AnnotationSpec() {
    private lateinit var exporter: Iso19115Exporter
    
    @Before
    fun init() {
        exporter = Iso19115Exporter()
    }

    @Test
    fun normalExport() {
        val json =
            "{\"title\": \"Test Export 1\", \"description\": \"This is the description of the exported document\"}"
        val jsonNode = ObjectMapper().readTree(json)
        val result = (exporter.run(jsonNode) as String).replace("\n\\s+".toRegex(), "")
        assertThat(
            result, CoreMatchers.containsString(
                "<gmd:title>" +
                        "<gco:CharacterString>Test Export 1</gco:CharacterString>" +
                        "</gmd:title>"
            )
        )
        assertThat(
            result, CoreMatchers.containsString(
                "<gmd:abstract>" +
                        "<gco:CharacterString>This is the description of the exported document</gco:CharacterString>" +
                        "</gmd:abstract>"
            )
        )
    }

    @Test
    fun anchorLink() {
        val json = "{ \"keywords\": [{ \"name\": \"test-keyword 1\", \"link\": \"http://abc.de/xyz\"}]}"
        val jsonNode = ObjectMapper().readTree(json)
        val result = (exporter.run(jsonNode) as String).replace("\n\\s+".toRegex(), "")
        assertThat(
            result, CoreMatchers.containsString(
                "<gmx:Anchor xlink:href=\"http://abc.de/xyz\">test-keyword 1</gmx:Anchor>"
            )
        )
        assertThat(
            result, CoreMatchers.containsString(
                "<gmd:title><gco:CharacterString>Mein Thesaurus</gco:CharacterString></gmd:title>"
            )
        )
        assertThat(
            result, CoreMatchers.containsString(
                "<gco:Date>10.10.1978</gco:Date>"
            )
        )
    }
}
