/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.exports.prettyFormatJson
import de.ingrid.igeserver.exports.prettyFormatXml
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.schema.SchemaUtils
import java.time.LocalDate
import java.util.regex.Pattern

/**
 * Updates the datestamp in the expected XML file to match the current date.
 * This is needed because the exporter now updates the datestamp to the current date.
 */
fun updateDatestampInExpectedXml(xml: String): String {
    val currentDate = LocalDate.now().toString()

    // Pattern to match only the date content within the datestamp in the XML
    val datePattern = Pattern.compile("(<gmd:dateStamp>\\s*<gco:Date>)(.*?)(</gco:Date>\\s*</gmd:dateStamp>)")
    val dateTimePattern = Pattern.compile("(<gmd:dateStamp>\\s*<gco:DateTime>)(.*?)(</gco:DateTime>\\s*</gmd:dateStamp>)")

    var result = xml

    // Replace only the date content, preserving the original XML structure
    val dateMatcher = datePattern.matcher(result)
    if (dateMatcher.find()) {
        result = dateMatcher.replaceAll("$1$currentDate$3")
    }

    // Replace only the datetime content, preserving the original XML structure
    val dateTimeMatcher = dateTimePattern.matcher(result)
    if (dateTimeMatcher.find()) {
        result = dateTimeMatcher.replaceAll("$1$currentDate$3")
    }

    return result
}

fun exportJsonToXML(exporter: IgeExporter, file: String, additional: ObjectNode? = null): String {
    val result = exportJsonToString(exporter, file, additional)
    return prettyFormatXml(result, 4).replace("\r\n", "\n")
}

fun exportDocToXML(exporter: IgeExporter, doc: Document): String = (exporter.run(doc, "test-catalog") as String).let {
    prettyFormatXml(it, 4).replace("\r\n", "\n")
        .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
}.also { println(it) }

fun exportJsonToJson(exporter: IgeExporter, file: String, additional: ObjectNode? = null): String = prettyFormatJson(exportJsonToString(exporter, file, additional))

private fun exportJsonToString(exporter: IgeExporter, file: String, additional: ObjectNode? = null): String {
    val input = SchemaUtils.getFileContent(file)
    val doc = convertToDocument(input)

    if (additional != null) {
        doc.data.setAll<ObjectNode>(additional)
        doc.catalog = Catalog().apply { identifier = "test-catalog" }
    }

    return exporter.run(doc, "test-catalog") as String
}
