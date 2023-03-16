package de.ingrid.igeserver.services

import de.ingrid.igeserver.api.GetCapabilitiesAnalysis
import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.utils.xpath.XPathUtils
import org.springframework.stereotype.Service
import org.w3c.dom.Document
import org.xml.sax.InputSource
import java.io.BufferedInputStream
import java.io.InputStream
import java.io.InputStreamReader
import java.io.PushbackInputStream
import java.net.URL
import java.nio.charset.StandardCharsets
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

@Service
class CapabilitiesService {

    fun analyzeGetRecordUrl(url: String): GetRecordUrlAnalysis {
        val doc = getDocumentFromUrl(url)
        val xpath = XPathUtils()
        val id = xpath.getString(
            doc,
            "//identificationInfo/MD_DataIdentification//identifier/MD_Identifier/code/CharacterString"
        )
        val title = xpath.getString(
            doc,
            "//identificationInfo/MD_DataIdentification//citation/CI_Citation/title/CharacterString"
        )
        val uuid = xpath.getString(doc, "//MD_Metadata/fileIdentifier/CharacterString")
        val downloads = mutableListOf<String>()

        val resources = xpath.getNodeList(
            doc,
            "//MD_DigitalTransferOptions/onLine/CI_OnlineResource/function/CI_OnLineFunctionCode"
        )
        for (j in 0 until resources.length) {
            val codeListValue = resources.item(j).attributes.getNamedItem("codeListValue").getNodeValue()
            if (codeListValue == "download") {
                val link = xpath.getString(resources.item(j), "../../linkage/URL")
                downloads.add(link)
            }
        }

        return GetRecordUrlAnalysis(id, uuid, title, downloads)
    }

    private fun getDocumentFromUrl(urlStr: String): Document {
        val url = URL(urlStr)
        // get the content in UTF-8 format, to avoid "MalformedByteSequenceException: Invalid byte 1 of 1-byte UTF-8 sequence"
        val input = checkForUtf8BOMAndDiscardIfAny(url.openStream())
        val reader = InputStreamReader(input, StandardCharsets.UTF_8)
        val inputSource = InputSource(reader)
        // Build a document from the xml response
        val factory = DocumentBuilderFactory.newInstance()
        // nameSpaceAware is false by default. Otherwise we would have to    
        // query for the correct namespace for every evaluation
        factory.isNamespaceAware = false
        factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true)
        factory.setFeature("http://xml.org/sax/features/external-general-entities", false)
        factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false)
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-dtd-grammar", false)
        factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false)
        val builder = factory.newDocumentBuilder()
        return builder.parse(inputSource)
    }

    private fun checkForUtf8BOMAndDiscardIfAny(inputStream: InputStream): InputStream {
        val pushbackInputStream = PushbackInputStream(BufferedInputStream(inputStream), 3)
        val bom = ByteArray(3)
        if (pushbackInputStream.read(bom) != -1 && !(bom[0].equals(0xEF) && bom[1].equals(0xBB) && bom[2].equals(0xBF))) {
            pushbackInputStream.unread(bom)
        }
        return pushbackInputStream
    }

    fun analyzeGetCapabilitiesUrl(url: String): GetCapabilitiesAnalysis {
        val document = getDocumentFromUrl(url)
        
        return GetCapabilitiesAnalysis()
    }


}