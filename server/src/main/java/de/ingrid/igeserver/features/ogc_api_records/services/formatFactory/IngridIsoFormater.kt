/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.formatFactory

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.services.ExportResult
import org.springframework.stereotype.Service
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult

@Service
class IngridIsoFormater : BodyFormater {

    override fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String {
        val documents: MutableList<String> = mutableListOf()
        val parsedXml = parseXmlWithMultipleDocs(data)
        documents.add(parsedXml)
        return documents[0]
    }

    override fun basic(content: Any, title: String?): ByteArray = throw NotImplementedError()

    override fun collections(collections: List<Any>, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        var response = ""
        for (catalog in collections) response += catalog.toString().substringAfter("?>")
        response

        val wrappedResponse = wrapperForXml(response, links, queryMetadata)

        return wrappedResponse.toByteArray()
    }

    override fun records(records: List<ExportResult>, useDraft: Boolean, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        var response = ""
        for (record in records) response += record.result?.toString(Charsets.UTF_8)?.substringAfter("?>")
        response

        val wrappedResponse = wrapperForXml(response, links, queryMetadata)

        return wrappedResponse.toByteArray()
    }

    private fun wrapperForXml(responseRecords: String, links: List<Link>?, queryMetadata: QueryMetadata?): String {
        // TODO Remove "<datasets>" if isSingleRecord ?
        val xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><datasets>$responseRecords</datasets>"
        if (links == null && queryMetadata == null) return xmlString

        val xmlInput = InputSource(StringReader(xmlString))
        val dbf = DocumentBuilderFactory.newInstance()
        val doc = dbf.newDocumentBuilder().parse(xmlInput)
        val wrapper = doc.getElementsByTagName("datasets")
        val wrapperElement = wrapper.item(0) as Element

        if (queryMetadata != null) {
            wrapperElement.setAttribute("numberReturned", queryMetadata.numberReturned.toString())
            wrapperElement.setAttribute("numberMatched", queryMetadata.numberMatched.toString())
            wrapperElement.setAttribute("timeStamp", queryMetadata.timeStamp.toString())
        }

        if (links != null) {
            val xmlLinks = links.filter { it.type == "text/xml" }
            val selfLink = (xmlLinks.find { it.rel == "self" })?.href
            val collectionLink = (links.find { it.rel == "collection" })?.href
            val prevLink = (xmlLinks.find { it.rel == "prev" })?.href
            val nextLink = (xmlLinks.find { it.rel == "next" })?.href

            if (selfLink != null) wrapperElement.setAttribute("self", selfLink)
            if (collectionLink != null) wrapperElement.setAttribute("collection", collectionLink)
            if (prevLink != null) wrapperElement.setAttribute("prev", prevLink)
            if (nextLink != null) wrapperElement.setAttribute("next", nextLink)

            val alternateLinks = links.filter { it.rel == "alternate" }
            val alternates: MutableList<String> = mutableListOf()
            for (alternate in alternateLinks) alternates.add(alternate.href)
            wrapperElement.setAttribute("alternate", alternates.toString())
        }

        return xmlNodeToString(doc)
    }

    @Throws(java.lang.Exception::class)
    fun xmlNodeToString(newDoc: Node): String {
        val domSource = DOMSource(newDoc)
        val transformer: Transformer = TransformerFactory.newInstance().newTransformer()
        val sw = StringWriter()
        val sr = StreamResult(sw)
        transformer.transform(domSource, sr)
        return sw.toString()
    }

    private fun parseXmlWithMultipleDocs(data: String): String {
        val documents: MutableList<String> = mutableListOf()

        val xmlInput = InputSource(StringReader(data))
        val dbf = DocumentBuilderFactory.newInstance()
        dbf.isNamespaceAware = true
        val doc = dbf.newDocumentBuilder().parse(xmlInput)

        val datasetList = doc.documentElement.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd", "MD_Metadata")

        if (datasetList.length > 1) throw ClientException.withReason("Invalid request: XML body must contain exactly one 'MD_Metadata' element.")

        return data
    }

    override val typeInfo: FormaterTypeInfo
        get() = FormaterTypeInfo(
            "ingrid-iso",
            "InGrid ISO Formater",
            mimeTypes = listOf("text/xml", "application/rdf+xml", "application/xml"),
            exportType = "ingridISO",
        )
}
