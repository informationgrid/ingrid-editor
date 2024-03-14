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
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.exporter.model.BmiModel
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer

@Service
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
                listOf("bmi"),
                useForPublish = true
            )
        }

    override fun exportSql(catalogId: String) = """document.state = 'PUBLISHED'"""

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
