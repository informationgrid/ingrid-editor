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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.GetRecordUrlAnalysis
import de.ingrid.igeserver.services.getCapabilities.CapabilitiesBean
import de.ingrid.igeserver.services.getCapabilities.GetCapabilitiesParserFactory
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
import java.security.Principal
import javax.xml.XMLConstants
import javax.xml.parsers.DocumentBuilderFactory

@Service
class CapabilitiesService constructor(val capabilitiesParserFactory: GetCapabilitiesParserFactory){

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

    private fun getDocumentFromUrl(urlStr: String, namespaceAware: Boolean = false): Document {
        val url = URL(urlStr)
        // get the content in UTF-8 format, to avoid "MalformedByteSequenceException: Invalid byte 1 of 1-byte UTF-8 sequence"
        val input = checkForUtf8BOMAndDiscardIfAny(url.openStream())
        val reader = InputStreamReader(input, StandardCharsets.UTF_8)
        val inputSource = InputSource(reader)
        // Build a document from the xml response
        val factory = DocumentBuilderFactory.newInstance()
        // nameSpaceAware is false by default. Otherwise we would have to    
        // query for the correct namespace for every evaluation
        factory.isNamespaceAware = namespaceAware
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

    fun analyzeGetCapabilitiesUrl(principal: Principal, catalogId: String, url: String): CapabilitiesBean {
        val document = getDocumentFromUrl(url, true)
        
        return capabilitiesParserFactory.get(document, catalogId).getCapabilitiesData(document)
    }

// https://geoservices.krzn.de/security-proxy/services/wfs_moer_stolpersteine?REQUEST=GetCapabilities&SERVICE=WFS
}