import de.ingrid.utils.ElasticDocument
import io.ktor.client.*
import io.ktor.client.request.*
import io.ktor.client.statement.*
import io.ktor.http.*
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import org.w3c.dom.Document
import org.w3c.dom.Element
import org.w3c.dom.NodeList
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.OutputKeys
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.*
import javax.xml.namespace.NamespaceContext

class CSWClient(
    private val client: HttpClient,
    private val url: String,
    private val name: String,
    private val xslResourcePath: String
) {

    constructor(client: HttpClient, url: String, name: String) : this(client, url, name, "idf_1_0_0_to_iso_metadata.xsl")

    private val log = logger()
    private val documentBuilderFactory = DocumentBuilderFactory.newInstance().apply { isNamespaceAware = true }
    private val documentBuilder = documentBuilderFactory.newDocumentBuilder()
    private val transformerFactory = TransformerFactory.newInstance()
    private val operationEndpoints: Map<String, String>

    init {
        operationEndpoints = getEndpointsFromCapabilities()
    }

    fun insertOrUpdate(doc: ElasticDocument, catalogId: String, transactionId: String) {
        val response = doc.get("idf").toString()
        val idfXml = documentBuilder.parse(InputSource(StringReader(response)))
        val transformedXml = transformXml(idfXml)

        transformedXml.addDescriptiveKeywordsWithThesaurus(listOf(catalogId, transactionId), "INGRID - internal system keywords.", "2025-01-01" )

        if (recordExists(doc)) {
            val updateRequest = createCswTransactionRequest(transformedXml, "Update")
            val updateResponse = executeCswXMLPostRequest(getOperationEndpoint("Transaction", "POST"), updateRequest)
            handleCswTransactionResponse(updateResponse, "Update")
        } else {
            val insertRequest = createCswTransactionRequest(transformedXml, "Insert")
            val insertResponse = executeCswXMLPostRequest(getOperationEndpoint("Transaction", "POST"), insertRequest)
            handleCswTransactionResponse(insertResponse, "Insert")
        }
    }

    fun cleanupOrphans(catalogId: String, transactionId: String) {
        val deleteRequest = createDeleteRequest(catalogId, transactionId)
        val deleteResponse = executeCswXMLPostRequest(getOperationEndpoint("Transaction", "POST"), deleteRequest)
        handleCswTransactionResponse(deleteResponse, "Delete")
    }

    private fun handleCswTransactionResponse(response: String?, operation: String) {
        if (response == null) {
            log.error("CSW $operation failed: Response is null")
            return
        }

        if (response.contains("ExceptionReport")) {
            log.error("CSW $operation returned an exception: $response")
            return
        }

        try {
            val doc = documentBuilder.parse(InputSource(StringReader(response)))
            val transactionSummaryNode = doc.documentElement.getElementsByTagNameNS("http://www.opengis.net/cat/csw/2.0.2", "TransactionSummary").item(0) as? org.w3c.dom.Element

            if (transactionSummaryNode != null) {
                val count = when (operation) {
                    "Delete" -> transactionSummaryNode.getElementsByTagNameNS("http://www.opengis.net/cat/csw/2.0.2", "totalDeleted").item(0)?.textContent?.toIntOrNull() ?: 0
                    "Insert" -> transactionSummaryNode.getElementsByTagNameNS("http://www.opengis.net/cat/csw/2.0.2", "totalInserted").item(0)?.textContent?.toIntOrNull() ?: 0
                    "Update" -> transactionSummaryNode.getElementsByTagNameNS("http://www.opengis.net/cat/csw/2.0.2", "totalUpdated").item(0)?.textContent?.toIntOrNull() ?: 0
                    else -> 0
                }
                log.info("CSW $operation operation successful. $count records $operation" + (if (operation == "Insert") "ed" else "d"))

            } else {
                log.warn("CSW $operation operation successful, but no TransactionSummary was found in the response. Response: $response")
            }

        } catch (e: Exception) {
            log.error("Error parsing $operation response: ${e.message}", e)
        }
    }

    private fun extractIdentifiers(response: String): List<String> {
        val document = documentBuilder.parse(InputSource(StringReader(response)))
        val records = document.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "identifier")
        return (0 until records.length).mapNotNull { i ->
            records.item(i).textContent
        }
    }

    fun recordExists(doc: ElasticDocument): Boolean = runBlocking {
        val uuid = doc.get("t01_object.id")
        try {
            val response: String = client.get( getOperationEndpoint("GetRecordById", "GET") + "?REQUEST=GetRecordById&ID=$uuid&SERVICE=CSW&VERSION=2.0.2&elementSetName=brief&startPosition=1&maxRecords=1").bodyAsText()
            val cswResponse = documentBuilder.parse(InputSource(StringReader(response)))
            cswResponse.getElementsByTagNameNS("http://www.opengis.net/cat/csw/2.0.2", "BriefRecord").length > 0
        } catch (e: Exception) {
            log.error("Failed to check existence: ${e.message}", e)
            false
        }
    }

    private fun getOperationEndpoint(operationName: String, httpMethod: String): String? = operationEndpoints["$operationName-$httpMethod"]

    private fun getEndpointsFromCapabilities(): Map<String, String> = runBlocking {
        try {
            val response: String = client.get("$url?service=CSW&version=2.0.2&request=GetCapabilities").bodyAsText()
            val doc = documentBuilder.parse(InputSource(StringReader(response)))

            val endpoints = mutableMapOf<String, String>()

            val getRecordsPost = doc.evaluateXPath("//ows:Operation[@name='GetRecords']/ows:DCP/ows:HTTP/ows:Post").item(0) as? org.w3c.dom.Element
            val getRecordsGet = doc.evaluateXPath("//ows:Operation[@name='GetRecords']/ows:DCP/ows:HTTP/ows:Get").item(0) as? org.w3c.dom.Element
            val getRecordByIdPost = doc.evaluateXPath("//ows:Operation[@name='GetRecordById']/ows:DCP/ows:HTTP/ows:Post").item(0) as? org.w3c.dom.Element
            val getRecordByIdGet = doc.evaluateXPath("//ows:Operation[@name='GetRecordById']/ows:DCP/ows:HTTP/ows:Get").item(0) as? org.w3c.dom.Element
            val transactionPost = doc.evaluateXPath("//ows:Operation[@name='Transaction']/ows:DCP/ows:HTTP/ows:Post").item(0) as? org.w3c.dom.Element
            val transactionGet = doc.evaluateXPath("//ows:Operation[@name='Transaction']/ows:DCP/ows:HTTP/ows:Get").item(0) as? org.w3c.dom.Element

            getRecordsPost?.let { endpoints["GetRecords-POST"] = it.getAttribute("xlink:href") }
            getRecordsGet?.let { endpoints["GetRecords-GET"] = it.getAttribute("xlink:href") }
            getRecordByIdPost?.let { endpoints["GetRecordById-POST"] = it.getAttribute("xlink:href") }
            getRecordByIdGet?.let { endpoints["GetRecordById-GET"] = it.getAttribute("xlink:href") }
            transactionPost?.let { endpoints["Transaction-POST"] = it.getAttribute("xlink:href") }
            transactionGet?.let { endpoints["Transaction-GET"] = it.getAttribute("xlink:href") }

            endpoints

        } catch (e: Exception) {
            log.error("Failed to get capabilities: ${e.message}", e)
            emptyMap() // Or throw an exception if you prefer
        }
    }

    private fun executeCswXMLPostRequest(endpoint: String?, request: String): String? = runBlocking {
        try {
            if (endpoint == null)  throw Exception("Endpoint is null.")
            client.post(endpoint) {
                contentType(ContentType.Application.Xml)
                setBody(request)
            }.bodyAsText()
        } catch (e: Exception) {
            log.error("Failed to execute CSW Request: ${e.message}", e)
            null
        }
    }

    private fun createCswTransactionRequest(xmlDoc: org.w3c.dom.Document, operation: String): String {
        val elementName = if (operation == "Update") "csw:Update" else "csw:Insert"
        return """
            <csw:Transaction service="CSW" version="2.0.2" xmlns:csw="http://www.opengis.net/cat/csw/2.0.2">
                <$elementName>${transformDocumentToString(xmlDoc)}</$elementName>
            </csw:Transaction>
        """.trimIndent()
    }

    private fun createDeleteRequest(datasource: String, transactionId: String): String {
        return """
            <csw:Transaction xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:ogc="http://www.opengis.net/ogc" xmlns:dc="http://purl.org/dc/elements/1.1/" service="CSW" version="2.0.2">
                <csw:Delete>
                    <csw:Constraint version="1.1.0">
                        <ogc:Filter>
                            <ogc:And>                            
                                <ogc:PropertyIsLike wildCard="*" singleChar="?" escapeChar="\">
                                    <ogc:PropertyName>dc:subject</ogc:PropertyName>
                                    <ogc:Literal>*$datasource*</ogc:Literal>
                                </ogc:PropertyIsLike>
                                <ogc:Not>
                                    <ogc:PropertyIsLike wildCard="*" singleChar="?" escapeChar="\">
                                        <ogc:PropertyName>dc:subject</ogc:PropertyName>
                                        <ogc:Literal>*$transactionId*</ogc:Literal>
                                    </ogc:PropertyIsLike>
                                </ogc:Not>
                            </ogc:And>
                        </ogc:Filter>
                    </csw:Constraint>
                
                </csw:Delete>
            </csw:Transaction>
        """.trimIndent()
    }

    private fun transformDocumentToString(doc: org.w3c.dom.Document): String {
        val writer = StringWriter()
        transformerFactory.newTransformer().apply {
            setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes")
            transform(DOMSource(doc), StreamResult(writer))
        }
        return writer.toString()
    }

    private fun transformXml(xmlDoc: org.w3c.dom.Document): org.w3c.dom.Document {
        val xslStream = this.javaClass.classLoader.getResourceAsStream(xslResourcePath) // Use the path
        if (xslStream == null) {
            throw IllegalStateException("XSLT resource not found at: $xslResourcePath") // Handle missing resource
        }
        return transformerFactory.newTransformer(javax.xml.transform.stream.StreamSource(xslStream)).run {
            val result = javax.xml.transform.dom.DOMResult()
            transform(DOMSource(xmlDoc), result)
            result.node as org.w3c.dom.Document
        }
    }

    private fun Document.evaluateXPath(expression: String): NodeList {
        val xpathFactory = javax.xml.xpath.XPathFactory.newInstance()
        val xpath = xpathFactory.newXPath()

        xpath.namespaceContext = object : NamespaceContext {
            override fun getNamespaceURI(prefix: String): String? {
                return when (prefix) {
                    "ows" -> "http://www.opengis.net/ows"
                    "csw" -> "http://www.opengis.net/cat/csw/2.0.2"
                    "xlink" -> "http://www.w3.org/1999/xlink"
                    "dc" -> "http://purl.org/dc/elements/1.1/"
                    "dct" -> "http://purl.org/dc/terms/"
                    "gmd" -> "http://www.isotc211.org/2005/gmd"
                    "gml" -> "http://www.opengis.net/gml"
                    "ogc" -> "http://www.opengis.net/ogc"
                    "xs" -> "http://www.w3.org/2001/XMLSchema"
                    "xsi" -> "http://www.w3.org/2001/XMLSchema-instance"
                    "inspire_ds" -> "http://inspire.ec.europa.eu/schemas/inspire_ds/1.0"
                    "inspire_common" -> "http://inspire.ec.europa.eu/schemas/common/1.0"

                    else -> null
                }
            }

            override fun getPrefix(namespaceURI: String): String? {
                return null
            }

            override fun getPrefixes(namespaceURI: String): Iterator<String>? {
                return null
            }
        }

        return xpath.evaluate(expression, this, javax.xml.xpath.XPathConstants.NODESET) as NodeList
    }

    fun Document.addDescriptiveKeywordsWithThesaurus(
        keywords: List<String>,
        thesaurusTitle: String,
        thesaurusPublicationDate: String, // Format: "yyyy-MM-dd"
        namespacePrefix: String = "gmd",
        namespaceURI: String = "http://www.isotc211.org/2005/gmd"
    ) {
        val descriptiveKeywordsElement = createElementNS(namespaceURI, "$namespacePrefix:descriptiveKeywords")
        val mdKeywordsElement = createElementNS(namespaceURI, "$namespacePrefix:MD_Keywords")

        // Add keywords
        for (keyword in keywords) {
            val keywordElement = createElementNS(namespaceURI, "$namespacePrefix:keyword")
            val keywordCharacterString = createElementNS("http://www.isotc211.org/2005/gco", "gco:CharacterString")
            keywordCharacterString.textContent = keyword
            keywordElement.appendChild(keywordCharacterString)
            mdKeywordsElement.appendChild(keywordElement)
        }

        val thesaurusNameElement = createElementNS(namespaceURI, "$namespacePrefix:thesaurusName")
        val ciCitationElement = createElementNS(namespaceURI, "$namespacePrefix:CI_Citation")
        val titleElement = createElementNS(namespaceURI, "$namespacePrefix:title")
        val characterStringElement = createElementNS("http://www.isotc211.org/2005/gco", "gco:CharacterString")
        characterStringElement.textContent = thesaurusTitle
        titleElement.appendChild(characterStringElement)
        ciCitationElement.appendChild(titleElement)

        // Add publication date
        val dateElement = createElementNS(namespaceURI, "$namespacePrefix:date")
        val ciDateElement = createElementNS(namespaceURI, "$namespacePrefix:CI_Date")
        val date2Element = createElementNS(namespaceURI, "$namespacePrefix:date")
        val dateTypeElement = createElementNS(namespaceURI, "$namespacePrefix:dateType")
        val ciDateTypeCodeElement = createElementNS(namespaceURI, "$namespacePrefix:CI_DateTypeCode")
        ciDateTypeCodeElement.setAttribute("codeList", "http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode")
        ciDateTypeCodeElement.setAttribute("codeListValue", "publication")
        ciDateTypeCodeElement.textContent = "publication"

        val df = SimpleDateFormat("yyyy-MM-dd")
        val dateText = try {
            df.format(df.parse(thesaurusPublicationDate))
        } catch (e: Exception) {
            df.format(Date()) // Fallback to current date if parsing fails
        }
        val gcoDateElement = createElementNS("http://www.isotc211.org/2005/gco", "gco:Date")
        gcoDateElement.textContent = dateText

        date2Element.appendChild(gcoDateElement)
        ciDateElement.appendChild(date2Element)
        ciDateElement.appendChild(dateTypeElement)
        dateTypeElement.appendChild(ciDateTypeCodeElement)
        dateElement.appendChild(ciDateElement)
        ciCitationElement.appendChild(dateElement)
        thesaurusNameElement.appendChild(ciCitationElement)
        mdKeywordsElement.appendChild(thesaurusNameElement)


        descriptiveKeywordsElement.appendChild(mdKeywordsElement)

        val identificationInfoElement = evaluateXPath("//gmd:MD_Metadata//gmd:identificationInfo").item(0) as? Element
        if (identificationInfoElement != null) {

            // Find the correct position for the new element based on ISO 19139 order
            val possibleSiblingElements = listOf(
                "gmd:citation", "gmd:abstract", "gmd:purpose", "gmd:credit", "gmd:status", "gmd:pointOfContact", "gmd:resourceMaintenance", "gmd:graphicOverview", "gmd:resourceFormat",  // Elements *before* descriptiveKeywords
                "gmd:descriptiveKeywords" // descriptiveKeywords can also be placed multiple times
            ).reversed()

            var insertionPoint: org.w3c.dom.Node? = null

            for (siblingElementName in possibleSiblingElements) {
                insertionPoint = evaluateXPath("//gmd:identificationInfo//$siblingElementName[last()]").item(0) as? Element

                if (insertionPoint != null) {
                    insertionPoint = insertionPoint.nextSibling // Insert *after* the sibling
                    break // Stop searching once a sibling is found
                }
            }

            if (insertionPoint != null) {
                insertionPoint.parentNode.insertBefore(descriptiveKeywordsElement, insertionPoint)
            } else {
                identificationInfoElement.appendChild(descriptiveKeywordsElement) // Append if no suitable sibling is found
            }

        } else {
            println("Warning: Could not find gmd:identificationInfo element to append to.")
        }
    }



    fun getClient(): HttpClient = client
    fun getUrl(): String = url
    fun getName(): String = name

}

