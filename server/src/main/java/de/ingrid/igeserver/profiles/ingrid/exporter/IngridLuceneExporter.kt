package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.exporter.LuceneExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.repository.CatalogRepository
import gg.jte.TemplateOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class IngridLuceneExporter @Autowired constructor(
    catalogRepo: CatalogRepository,
    codelistService: CodeListService
) : LuceneExporter(catalogRepo, codelistService) {

    fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = JsonStringOutput()
        val catalog = catalogRepo.findByIdentifier(catalogId)
        templateEngine.render("ingrid/template-lucene.jte", getMapFromObject(doc, catalog), output)
        return output.toString()
    }

    fun getMapFromObject(json: Document, catalog: Catalog): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf(
            "map" to mapOf(
                "model" to mapper.convertValue(json, IngridModel::class.java),
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings?.config?.partner),
                "provider" to mapCodelistValue("111", catalog.settings?.config?.provider)
            )
        )

    }

}
