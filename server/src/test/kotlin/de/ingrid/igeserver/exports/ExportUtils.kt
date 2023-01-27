package de.ingrid.igeserver.exports

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.vladmihalcea.hibernate.util.ClassLoaderUtils
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

// TODO: use/replace other function from document service, but as here or as a companion object
//       to use function without instantiation of the class
fun convertToDocument(json: String) = jacksonObjectMapper().readValue<Document>(json)

fun prettyFormatXml(input: String, indent: Int): String {
    return try {
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
}
