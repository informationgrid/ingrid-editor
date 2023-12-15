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
package de.ingrid.igeserver.exports

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.apache.commons.codec.digest.DigestUtils
import java.io.StringReader
import java.io.StringWriter
import javax.xml.XMLConstants
import javax.xml.transform.OutputKeys
import javax.xml.transform.Source
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource

data class ExportOptions(val includeDraft: Boolean)

interface IgeExporter {
    val typeInfo: ExportTypeInfo

    fun run(doc: Document, catalogId: String, options: ExportOptions = ExportOptions(false)): Any
    fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    fun prettyFormat(input: String, indent: Int): String {
        return try {
            val xmlInput: Source = StreamSource(StringReader(input))
            val stringWriter = StringWriter()
            val xmlOutput = StreamResult(stringWriter)
            val transformerFactory = TransformerFactory.newInstance()
            transformerFactory.setAttribute("indent-number", indent)
            transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
            transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "")
            val transformer: Transformer =
                transformerFactory.newTransformer(StreamSource(javaClass.getResourceAsStream("/prettyprint.xsl")))
            transformer.setOutputProperty(OutputKeys.INDENT, "yes")
            transformer.transform(xmlInput, xmlOutput)
            xmlOutput.writer.toString()/*
                .replace("\n", "&#10;")
                .replace("\r", "&#13;")
                .replace("\t", "&#9;")*/
        } catch (e: Exception) {
            throw RuntimeException(e) // simple exception handling, please review it
        }
    }

    fun calculateFingerprint(doc: Any): String {
        return DigestUtils.sha256Hex(doc.toString())
    }
}
