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