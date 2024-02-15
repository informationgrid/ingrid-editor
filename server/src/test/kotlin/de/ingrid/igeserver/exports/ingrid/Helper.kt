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
package de.ingrid.igeserver.exports.ingrid

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.GENERATED_UUID_REGEX
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.convertToDocument
import de.ingrid.igeserver.exports.prettyFormatXml
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.schema.SchemaUtils

fun exportJsonToXML(exporter: IgeExporter, file: String, additional: ObjectNode? = null): String {
    val input = SchemaUtils.getJsonFileContent(file)
    val doc = convertToDocument(input)

    if (additional != null) {
        doc.data.setAll<ObjectNode>(additional)
    }

    val result = exporter.run(doc, "test-catalog") as String
    return prettyFormatXml(result, 4).replace("\r\n", "\n")
}

fun exportDocToXML(exporter: IgeExporter, doc: Document): String {
    return (exporter.run(doc, "test-catalog") as String).let {
        prettyFormatXml(it, 4).replace("\r\n", "\n")
            .replace(GENERATED_UUID_REGEX, "ID_00000000-0000-0000-0000-000000000000")
    }.also { println(it) }
}

fun exportJsonStringToXML(exporter: IgeExporter, json: String): String {
    val doc = convertToDocument(json)
    val result = exporter.run(doc, "test-catalog") as String
    return prettyFormatXml(result, 4).replace("\r\n", "\n")
}


fun exportJsonToJson(exporter: IgeExporter, file: String): String {
    val input = SchemaUtils.getJsonFileContent(file)
    val doc = convertToDocument(input)
    val result = exporter.run(doc, "test-catalog") as String
    return result
}
