package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.LuceneExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class IngridLuceneExporter @Autowired constructor(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)


    val codelistTransformer = CodelistTransformer(codelistHandler)

    fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = JsonStringOutput()
        val catalog = catalogService.getCatalogById(catalogId)
        templateEngine.render("ingrid/template-lucene.jte", getMapFromObject(doc, catalog), output)
        return output.toString()
    }

    fun getMapFromObject(json: Document, catalog: Catalog): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        val modelTransformer =
            IngridModelTransformer(
                mapper.convertValue(json, IngridModel::class.java),
                catalog.identifier,
                codelistTransformer,
                config,
                catalogService
            )
        return mapOf(
            "map" to mapOf(
                "model" to modelTransformer,
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings?.config?.partner),
                "provider" to mapCodelistValue("111", catalog.settings?.config?.provider)
            )
        )

    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String {
        return partner?.let { codelistHandler.getCodelistValue(codelistId, it, "ident") } ?: ""
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
