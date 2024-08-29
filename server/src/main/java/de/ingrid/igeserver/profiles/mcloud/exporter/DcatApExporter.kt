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
package de.ingrid.igeserver.profiles.mcloud.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.mitchellbosecke.pebble.PebbleEngine
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.mcloud.exporter.model.MCloudModel
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service
import java.io.StringWriter
import java.io.Writer

@Service
class DcatApExporter : IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "mcloudDcat",
        "mCLOUD DCAT-AP.de",
        "Export von mCLOUD Datensätzen ins DCAT-AP.de Format.",
        "text/xml",
        "xml",
        listOf("mcloud"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val engine = PebbleEngine.Builder()
            .newLineTrimming(false)
            .build()

        val compiledTemplate = engine.getTemplate("templates/export/mcloud/dcat.peb")

        val writer: Writer = StringWriter()
        val map = getMapFromObject(doc)
        compiledTemplate.evaluate(writer, map)
        return writer.toString().replace("\\s+\n".toRegex(), "\n")
    }

    private fun getMapFromObject(json: Document): Map<String, Any> {
        return mapOf("model" to jacksonObjectMapper().convertValue(json, MCloudModel::class.java))
    }
}
