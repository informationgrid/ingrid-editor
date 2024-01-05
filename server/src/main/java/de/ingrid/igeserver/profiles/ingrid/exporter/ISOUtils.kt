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
package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.utils.tool.XsltUtils
import org.apache.logging.log4j.kotlin.logger
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory

val log = logger("ISOUtils")

private val XSL_IDF_TO_ISO_FULL = "idf_1_0_0_to_iso_metadata.xsl"

fun convertStringToDocument(record: String): Document? {
    try {
        val domFactory = DocumentBuilderFactory.newInstance()
        domFactory.isNamespaceAware = true
        val builder = domFactory.newDocumentBuilder()
        return builder.parse(InputSource(StringReader(record)))
    } catch (ex: Exception) {
        log.error("Could not convert String to Document Node: ", ex)
    }
    return null
}

fun transformIDFtoIso(idfDocument: Document) = XsltUtils().transform(idfDocument, XSL_IDF_TO_ISO_FULL) as Document