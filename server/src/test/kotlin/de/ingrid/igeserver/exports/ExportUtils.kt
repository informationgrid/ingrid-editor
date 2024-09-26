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
package de.ingrid.igeserver.exports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import java.io.StringReader
import java.io.StringWriter
import javax.xml.XMLConstants
import javax.xml.transform.OutputKeys
import javax.xml.transform.Source
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource

val GENERATED_UUID_REGEX = Regex("ID_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")

// TODO: use/replace other function from document service, but as here or as a companion object
//       to use function without instantiation of the class
fun convertToDocument(json: String) = jacksonObjectMapper().readValue<Document>(json)

fun prettyFormatXml(input: String, indent: Int): String = try {
    val xmlInput: Source = StreamSource(StringReader(input))
    val stringWriter = StringWriter()
    val xmlOutput = StreamResult(stringWriter)
    val transformerFactory = TransformerFactory.newInstance()
    transformerFactory.setAttribute("indent-number", indent)
    transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
    transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "")
    val transformer: Transformer =
        transformerFactory.newTransformer(StreamSource(object {}.javaClass.getResourceAsStream("/prettyprint.xsl")))
    transformer.setOutputProperty(OutputKeys.INDENT, "yes")
    transformer.transform(xmlInput, xmlOutput)
    xmlOutput.writer.toString()
} catch (e: Exception) {
    throw RuntimeException(e) // simple exception handling, please review it
}

fun prettyFormatJson(json: String): String = jacksonObjectMapper().readValue(json, JsonNode::class.java).toPrettyString()
