package de.ingrid.igeserver.exporter

import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.repository.CatalogRepository
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.output.StringOutput
import org.unbescape.json.JsonEscape


open class LuceneExporter(val catalogRepo: CatalogRepository, private val codelistService: CodeListService) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)
    fun mapCodelistValue(codelistId: String, partner: String?): String {
        return codelistService.getCodeListValue(codelistId, partner, "ident") ?: ""
    }

    class JsonStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                JsonEscape.escapeJson(value)
            )
        }
    }
}
