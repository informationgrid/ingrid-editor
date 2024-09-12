/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.bmi.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.exporter.model.BmiModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class BmiExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
) : IgeExporter {

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.DATA,
                "index",
                "BMI Index",
                "Export der Adressen für die weitere Verwendung im  Exporter.",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("bmi"),
                useForPublish = true,
            )
        }

    override fun exportSql(catalogId: String) = """document.state = 'PUBLISHED'"""

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val output: TemplateOutput = JsonStringOutput()
        if (doc.type == "FOLDER") return ""

        templateEngine.render(
            "export/bmi/index.jtl",
            getMapFromObject(doc, catalogId, options),
            output,
        )

        return output.toString()
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: Document, catalogId: String, options: ExportOptions): Map<String, Any> {
        val modelTransformer = getModelTransformer(json, catalogId, options)
        return mapOf(
            "map" to mapOf(
                "model" to modelTransformer,
            ),
        )
    }

    private fun getBmiModel(json: Document, catalogId: String): BmiModel {
        return jacksonObjectMapper().convertValue(json, BmiModel::class.java)
    }

    private fun getModelTransformer(json: Document, catalogId: String, exportOptions: ExportOptions): Any {
        val codelistTransformer = CodelistTransformer(codelistHandler, catalogId)

        return BmiModelTransformer(
            TransformerConfig(
                getBmiModel(json, catalogId),
                catalogId,
                codelistTransformer,
                config,
                catalogService,
                TransformerCache(),
                json,
                documentService,
                exportOptions.tags,
            ),
        )
    }
}

class JsonStringOutput : StringOutput() {
    override fun writeUserContent(value: String?) {
        if (value == null) return
        super.writeUserContent(
            JsonEscape.escapeJson(value),
        )
    }
}
