package de.ingrid.igeserver.exports.iso19115

import com.fasterxml.jackson.databind.JsonNode
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer
import java.util.*

@Service
class Iso19115Exporter : IgeExporter {
    private val info: ExportTypeInfo

    override val typeInfo: ExportTypeInfo
        get() = info

    override fun run(doc: Document, catalogId: String): Any {
        val engine = PebbleEngine.Builder()
            .newLineTrimming(false)
            .build()
        val compiledTemplate = engine.getTemplate("templates/export/iso/iso-base.peb")
        val writer: Writer = StringWriter()
        compiledTemplate.evaluate(writer, createContext(doc))
        return writer.toString().replace("\\s+\n".toRegex(), "\n")
    }

    override fun toString(exportedObject: Any): String {
        return ""
    }

    private fun createContext(json: Document): Map<String, Any> {
        val context: MutableMap<String, Any> = HashMap()
        val iso = Iso()
        iso.title = json.title
        iso.description = getStringOf(json.data, "description")
        iso.uuid = "123456789"
        iso.hierarchyLevel = "dataset"
        iso.modified = Date()
        iso.useConstraints = useConstraints
        iso.thesauruses = getKeywords(json.data)
        context["iso"] = iso
        return context
    }

    private fun getKeywords(json: JsonNode): List<Thesaurus>? {
        val keywordsNode = json["keywords"] ?: return null
        val thesauruses: MutableList<Thesaurus> = ArrayList()
        val keywords: MutableList<Keyword> = ArrayList()
        val keywordsIterator: Iterator<JsonNode> = keywordsNode.iterator()
        while (keywordsIterator.hasNext()) {
            val next = keywordsIterator.next()
            val keyword = Keyword(getStringOf(next, "name"), getStringOf(next, "link"))
            keywords.add(keyword)
        }
        val thesaurus = Thesaurus("Mein Thesaurus", "10.10.1978", keywords = keywords)
        thesauruses.add(thesaurus)
        return thesauruses
    }

    private val useConstraints: List<UseConstraint>
        get() {
            val list: MutableList<UseConstraint> = ArrayList()
            val useConstraint = UseConstraint()
            useConstraint.data = "{title: 'xxx'}"
            val otherConstraints = Arrays.asList("My use constraint", "Quellenvermerk: my source note")
            useConstraint.otherConstraints = otherConstraints
            list.add(useConstraint)
            val useConstraint2 = UseConstraint()
            useConstraint2.data = "{title: 'zzz'}"
            val otherConstraints2 = listOf("My other constraint")
            useConstraint2.otherConstraints = otherConstraints2
            list.add(useConstraint2)
            return list
        }

    private fun getStringOf(node: JsonNode, key: String): String? {
        return if (node.has(key)) node[key].asText() else null
    }

    init {
        info = ExportTypeInfo(DocumentCategory.DATA, "iso19115", "ISO-19115", "Export in das ISO-19115 Format", "text/xml", "xml", listOf("ingrid"))
    }
}
