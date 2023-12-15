/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
import de.ingrid.igeserver.repository.CatalogRepository
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class LuceneExporter(
    val catalogRepo: CatalogRepository,
    val codelistService: CodeListService
) {

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    fun run(doc: Document, catalogId: String): Any {
        if (doc.type == "FOLDER") return "{}"

        val output: TemplateOutput = JsonStringOutput()
        val catalog = catalogRepo.findByIdentifier(catalogId)
        templateEngine.render("uvp/template-lucene.jte", getMapFromObject(doc, catalog), output)
        return output.toString()
    }

    private fun getMapFromObject(json: Document, catalog: Catalog): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf(
            "map" to mapOf(
                "model" to mapper.convertValue(json, UVPModel::class.java).apply { init(catalog.identifier) },
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings?.config?.partner),
                "provider" to mapCodelistValue("111", catalog.settings?.config?.provider)
            )
        )

    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String {
        return codelistService.getCodeListValue(codelistId, partner, "ident") ?: ""
    }

    private class JsonStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                JsonEscape.escapeJson(value)
            )
        }
    }
}
