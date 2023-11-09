package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.InvalidParameterException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.ImporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.w3c.dom.Element
import org.w3c.dom.Node
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import java.security.Principal
import java.text.SimpleDateFormat
import java.time.Instant
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult
import kotlin.math.abs


data class XmlMetadata(
        var dataset: List<Metadata>,
)
data class SupportFormat(
        var format: String,
        var mimeType: String
)
data class QueryMetadata(
        var numberReturned: Int,
        var numberMatched: Int,
        var timeStamp: Instant?,
)

@Service
class OgcRecordService @Autowired constructor(
        private val catalogService: CatalogService,
        private val exportService: ExportService,
        private val importerFactory: ImporterFactory,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val internalExporter: InternalExporter,
        private val documentService: DocumentService,
        private val importService: ImportService
) {
    val apiHost = "http://localhost:8550"

    val supportedExportFormats = listOf("internal", "geojson", "html", "ingridISO")



    @Transactional
    fun transactionalImportDocuments(options: ImportOptions, collectionId: String, contentType: String, data: String, principal: Authentication, recordMustExist: Boolean, recordId: String?){
        importDocuments(options, collectionId, contentType, data, principal, recordMustExist, recordId)
    }

    fun importDocuments(options: ImportOptions, collectionId: String, contentType: String, data: String, principal: Authentication, recordMustExist: Boolean, recordId: String?){
        val docArray = prepareDataForImport(collectionId, contentType, data)
        for( doc in docArray ) {
            val optimizedImportAnalysis = importService.prepareImportAnalysis(collectionId, contentType, doc)
            if(optimizedImportAnalysis.existingDatasets.isNotEmpty()){
                    val id = optimizedImportAnalysis.existingDatasets[0].uuid
                if(!recordMustExist) {
                    throw ClientException.withReason("Import Failed: Record with ID '$id' already exists.")
                } else {
                    if(recordId != id) throw ClientException.withReason("Update Failed: Target ID '$recordId' does not match dataset ID '$id'.")
                }
            } else {
                if(recordMustExist) {
//                    val id = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId!!).id
                    throw NotFoundException.withMissingResource(recordId!!, "Record")
                }
            }
            importService.importAnalyzedDatasets(
                    principal = principal,
                    catalogId = collectionId,
                    analysis = optimizedImportAnalysis,
                    options = options,
                    message = Message()
            )
        }
    }

    private fun prepareDataForImport(collectionId: String, mimeType: String, docData: String): List<String> {
        val documents: MutableList<String> = mutableListOf()
        if (mimeType == "application/xml") {
            val parsedXml = parseXmlWithMultipleDocs(docData, collectionId)
            for (doc in parsedXml) {
                documents.add(doc)
            }
        }
        if (mimeType == "application/json") {
            var jsonData: JsonNode = jacksonObjectMapper().readValue(docData, JsonNode::class.java)
            // wrap data in array if single dataset without array
            jsonData = if (jsonData[0] == null) jacksonObjectMapper().createArrayNode().add(jsonData) else jsonData
            // check json format
            val jsonFormat = if (jsonData[0].get("properties") == null) "internal" else "geojson"

            for (doc in jsonData) {
                if (jsonFormat == "internal") {
                    val internalDoc = internalExporter.addExportWrapper(collectionId, doc, null)
                    documents.add(internalDoc.toString())
                }
                if (jsonFormat == "geojson") {
                    val relevantNode = doc.get("properties")
                    val geoJsonDoc = internalExporter.addExportWrapper(collectionId, relevantNode, null)
                    documents.add(geoJsonDoc.toString())
                }
            }
        }
        return documents
    }

    private fun parseXmlWithMultipleDocs(data: String, collectionId: String): List<String> {
        val documents: MutableList<String> = mutableListOf()

        val xmlInput = InputSource(StringReader(data))
        val dbf = DocumentBuilderFactory.newInstance()
        dbf.isNamespaceAware = true
        val doc = dbf.newDocumentBuilder().parse(xmlInput)

        val datasetList = doc.documentElement.getElementsByTagNameNS("http://www.isotc211.org/2005/gmd", "MD_Metadata")
        for (i in 0 until datasetList.length) {
            val stringMeta = xmlNodeToString(datasetList.item(i))
            documents.add(stringMeta)
        }
        // if not datasets-wrapper found return raw data
        if (datasetList.length == 0) documents.add(data)
        return documents
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

    fun responseHeaders(format: String, links: List<String>?): HttpHeaders {
        val responseHeaders = HttpHeaders()
        // add response format
        if (format == "internal" || format == "geojson" ) responseHeaders.add("Content-Type", "application/json")
        if (format == "html") responseHeaders.add("Content-Type", "text/html")
        if (format == "ingridISO") responseHeaders.add("Content-Type", "application/xml")
        // add next, previous & self links
        if (!links.isNullOrEmpty()) {
            for (link in links) {
                responseHeaders.add("Link", link)
            }
        }
        return responseHeaders
    }

    fun ogcDateTimeConverter(datetime: String): List<String> {
        val dateArray = datetime.split("/") // listOf(datetime)
        var dateList = dateArray.map { date -> if (date == "..") null else checkDatetime(date) }
        return dateArray
    }

    fun checkDatetime(date: String): String {
        val instance: Instant
        try {
            instance = Instant.parse(date)
        } catch (ex: AccessDeniedException) {
            throw ClientException.withReason("Malformed request syntax of DateTime:  $date")            // how to throw correct error ?
        }

        return instance.toString()
    }

    fun buildRecordsQuery(queryLimit: Int, queryOffset: Int, type: List<String>?, bbox: List<Float>?, datetime: String?): ResearchQuery {
        val clausesList: MutableList<BoolFilter> = mutableListOf()
        // filter: exclude FOLDERS
        clausesList.add(BoolFilter("OR", listOf("document_wrapper.type != 'FOLDER'"), null, null, false))

        clausesList.add(BoolFilter("OR", listOf("document1.state = 'PUBLISHED'"), null, null, false))
        // bbox // check if 4 values is true
        if (bbox != null) {
            val boundingBox = bbox.map { coordinate -> coordinate.toString() }
            clausesList.add(BoolFilter("OR", listOf("ingridSelectSpatial"), null, boundingBox, true))
        }
        // time span
        if (datetime != null) {
            val dateList = ogcDateTimeConverter(datetime)
            clausesList.add(BoolFilter("OR", listOf("selectTimespan"), null, dateList, true))
        }
        // filter by doc type
        if (type != null) {
            val typeList = mutableListOf<String>()
            for (name in type) {
                typeList.add("document_wrapper.type = '${name}'")
            }
            clausesList.add(BoolFilter("OR", typeList, null, null, false))
        }
        // prepare paging
//        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)

        // prepare query
        return ResearchQuery(
                term = null,
                clauses = BoolFilter(op = "AND", value = null, clauses = clausesList, parameter = null, isFacet = true),
//                orderByField = "title",
//                orderByDirection = "ASC",
                pagination = ResearchPaging(1, queryLimit, queryOffset)
        )
    }

    fun pageLimitAndOffset(offset: Int?, limit: Int?): LimitAndOffset {
        val defaultLimit = 10
        val minLimit = 1
        val maxLimit = Int.MAX_VALUE
        val queryLimit: Int = limit ?: defaultLimit
        if(queryLimit < minLimit || queryLimit > maxLimit) throw InvalidParameterException.withInvalidParameters("limit")
//        if (queryLimit > maxLimit) queryLimit = maxLimit
        val queryOffset: Int = if (offset === null) 0 else {
            if (offset < 0) 0 else offset
        }
        return LimitAndOffset(queryLimit, queryOffset)
    }

    fun getLinksForRecords(offset: Int?, limit: Int?, totalHits: Int, collectionId: String, requestedFormat: String): List<Link> {
        val list: MutableList<Link> = mutableListOf()

        val supportedFormats: List<SupportFormat> = listOf(
                SupportFormat( "internal", "application/json"),
                SupportFormat( "geojson", "application/json"),
                SupportFormat( "ingridISO", "text/xml"),
                SupportFormat( "html", "text/html")
        )

        // prepare pageing numbers
        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)
        val nextOffset: Int = queryOffset + queryLimit
        val prevOffset: Int = if (queryOffset < queryLimit) 0 else queryOffset - queryLimit

        // prepare string fragments
        val baseUrl = "${apiHost}/collections/${collectionId}"
        val recordBaseUrl = "$baseUrl/items?f="
        val limitString = if (limit !== null) "&limit=${queryLimit}" else ""
        val selfOffsetString = if (offset !== null) "&offset=${queryOffset}" else ""
        val prevOffsetString = "&offset=$prevOffset"
        val nextOffsetString = "&offset=$nextOffset"

        // add self Link to list
        list.add(createLink(
                url = recordBaseUrl + requestedFormat + limitString + selfOffsetString,
                "self",
                (supportedFormats.find{ it.format == (requestedFormat ?: "internal") })?.mimeType!!,
                "Link to this response"
        ))

        // add alternate, next, previous links for each format
        for(supported in supportedFormats) {
            val supportedFormat = supported.format
            list.add(createLink(
                    url = baseUrl + "?f=" + supported.format,
                    "collection",
                    supported.mimeType,
                    "Link to the containing collection in format '$supportedFormat' "
            ))
            if (supportedFormat != requestedFormat) list.add(createLink(
                    url = recordBaseUrl + supported.format + limitString + selfOffsetString,
                    "alternate",
                    supported.mimeType,
                    "Link to this response in format '$supportedFormat' "
            ))
            if (totalHits > nextOffset) list.add(createLink(
                    url = recordBaseUrl + supportedFormat + limitString + nextOffsetString,
                    "next",
                    supported.mimeType,
                    "Link to the next set of records in format '$supportedFormat' "
            ))
            if (queryOffset != 0) list.add(createLink(
                    url = recordBaseUrl + supportedFormat + limitString + prevOffsetString,
                    "prev",
                    supported.mimeType,
                    "Link to the previous set of records in format '$supportedFormat' "
            ))
        }

        return list
    }

    private fun createLink(url: String, rel: String, type: String, title: String): Link {
        return Link(
                href = url,
                rel = rel,
                type = type,
                title = title
        )
    }
    fun prepareCatalog(collectionId: String, exporter: OgcCatalogExporter, format: String): ByteArray {
        val catalog = exportCatalog( collectionId, exporter)
        val catalogAsList = listOf(catalog)
        val editedCatalog = editCatalogs(exporter.typeInfo.dataType, catalogAsList, format)
        return addWrapperToCatalog(editedCatalog, exporter.typeInfo.dataType, format, null, true, null)
    }

    fun prepareCatalogs(principal: Principal, format: String): ByteArray {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)
        val exporter = ogcCatalogExporterFactory.getExporter(format)
        val catalogList: MutableList<Any> = mutableListOf()
        for (catalog in catalogs) catalogList.add(exportCatalog(catalog.identifier, exporter))

        val editedCatalog = editCatalogs(exporter.typeInfo.dataType, catalogList, format)
        return addWrapperToCatalog(editedCatalog, exporter.typeInfo.dataType, format, null, true, null)
    }

    private fun exportCatalog(collectionId: String, exporter: OgcCatalogExporter): Any {
        try {
            val catalogData: Catalog = catalogService.getCatalogById(collectionId)
            return exporter.run(catalogData)
        } catch (e: Exception) {
            throw NotFoundException.withMissingResource(collectionId, "collection")
        }
    }

    private fun editCatalogs(mimeType: String, catalogList: List<Any>, format: String): Any{
        return if (mimeType == "text/xml") {
            var response = ""
            for (catalog in catalogList) response += catalog.toString().substringAfter("?>")
            response
        } else if (mimeType == "application/json") {
            val response: MutableList<JsonNode> = mutableListOf()
            val list: List<RecordCollection> = catalogList as List<RecordCollection>
            for (catalog in list) {
                val wrapperlessCatalog =  convertObject2Json(catalog)
//                val wc = jacksonObjectMapper().readValue(catalog , JsonNode::class.java)
                response.add(wrapperlessCatalog)
            }
            response
//            catalogList
        } else if (mimeType == "text/html") {
            var response = ""
            for (catalog in catalogList) response += catalog.toString()
            response
        } else {
            catalogList
        }
    }
    private fun addWrapperToCatalog(catalog: Any, mimeType: String, format: String, links: List<Link>?, singleRecord: Boolean?, queryMetadata: QueryMetadata?): ByteArray {
        var wrappedResponse = ""
        if(mimeType == "text/html") wrappedResponse = wrapperForHtml(catalog as String, links, queryMetadata)
        if(mimeType == "text/xml") wrappedResponse = wrapperForXml(catalog as String, links, queryMetadata)
        if(mimeType == "application/json")  wrappedResponse = wrapperForJson(catalog as List<JsonNode>, links, queryMetadata, singleRecord, format)
        return wrappedResponse.toByteArray()
    }

    private fun mapCatalogToRecordCollection(catalog: Catalog): RecordCollection {
        val links = "${apiHost}/collections/${catalog.identifier}/items"
        return RecordCollection(
                id = catalog.identifier,
                title = catalog.name,
                description = catalog.description,
                links = links,
                itemType = "record",
                type = "Collection",
                modelType = catalog.type,
                created = catalog.created,
                updated = catalog.modified,
        )
    }

    fun deleteRecord(principal: Principal, collectionId: String, recordId: String) {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        wrapper.id?.let { documentService.deleteDocument(principal, collectionId, it) }
    }

    fun prepareRecord(collectionId: String, recordId: String, format: String): Pair<ByteArray, String> {
        val record = exportRecord(recordId, collectionId, format)
        val mimeType = record.exportFormat.toString()

        val singleRecordInList: List<ExportResult> = listOf(record)
        val unwrappedRecord = removeDefaultWrapper(mimeType, singleRecordInList, format)
        val wrappedRecord = addWrapperToRecords(unwrappedRecord, mimeType, format,  null, true, null)
        return Pair(wrappedRecord, mimeType)
    }

    fun prepareRecords(records: ResearchResponse, collectionId: String, format: String, mimeType: String, links: List<Link>, queryMetadata: QueryMetadata): ByteArray {
        val recordList: List<ExportResult> = records.hits.map { record -> exportRecord(record._uuid!!, collectionId, format) }
        val unwrappedRecords = removeDefaultWrapper(mimeType, recordList, format)
        return addWrapperToRecords(unwrappedRecords, mimeType, format, links, false, queryMetadata)
    }

    private fun exportRecord(recordId: String, collectionId: String, format: String): ExportResult {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val id = wrapper.id!!
        val options = ExportRequestParameter(
                id = id,
                exportFormat = format,
                // TODO context of ingridISO exporter: check why address documents need to called as drafts
                useDraft = (format == "ingridISO" && wrapper.category == "address")
        )
        return exportService.export(collectionId, options)
    }


    private fun removeDefaultWrapper(mimeType: String, recordList: List<ExportResult>, format: String): Any{
        return if (mimeType == "text/xml") {
            var response = ""
            for (record in recordList) response += record.result.toString(Charsets.UTF_8).substringAfter("?>")
            response
        } else if (mimeType == "application/json") {
            val response: MutableList<JsonNode> = mutableListOf()
            for (record in recordList) {
                var wrapperlessRecord = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
                if(format == "internal") wrapperlessRecord = wrapperlessRecord.get("resources").get("published")
                response.add(wrapperlessRecord)
            }
            response
        } else if (mimeType == "text/html") {
            var response = ""
            for (record in recordList) response += record.result.toString(Charsets.UTF_8)
            response
        } else {
            recordList
        }
    }
    private fun addWrapperToRecords(responseRecords: Any, mimeType: String, format: String, links: List<Link>?, singleRecord: Boolean?, queryMetadata: QueryMetadata?): ByteArray {
        var wrappedResponse = ""
        if(mimeType == "text/html") wrappedResponse = wrapperForHtml(responseRecords as String, links, queryMetadata)
        if(mimeType == "text/xml") wrappedResponse = wrapperForXml(responseRecords as String, links, queryMetadata)
        if(mimeType == "application/json")  wrappedResponse = wrapperForJson(responseRecords as List<JsonNode>, links, queryMetadata, singleRecord, format)
        return wrappedResponse.toByteArray()
    }
    private fun convertObject2Json(data: Any): ObjectNode{
        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())
        mapper.dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        val node = mapper.convertValue(data, ObjectNode::class.java)
        node.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node
    }

    private fun wrapperForJson(responseRecords: List<JsonNode>, links: List<Link>?, queryMetadata: QueryMetadata?, singleRecord: Boolean?, format: String): String {
        val wrappedResponse: JsonNode
        val mapper = jacksonObjectMapper()
        if(format == "geojson" && singleRecord == true) {
                wrappedResponse = mapper.convertValue(responseRecords, JsonNode::class.java)
        } else if(format == "geojson" && singleRecord == false) {
                val response = RecordsResponse(
                        type = "FeatureCollection",
                        timeStamp = queryMetadata!!.timeStamp,
                        numberReturned = queryMetadata.numberReturned,
                        numberMatched = queryMetadata.numberMatched,
                        features = responseRecords,
                        links = links
                )
                wrappedResponse = convertObject2Json(response)
        }else {
            // internal json format
            val recordArray = mapper.createArrayNode()
            for( record in responseRecords) recordArray.add(convertObject2Json(record))
            wrappedResponse = recordArray
        }
        return wrappedResponse.toString()
    }

    private fun wrapperForXml(responseRecords: String, links: List<Link>?, queryMetadata: QueryMetadata?): String{
        val xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><datasets>$responseRecords</datasets>"
        if(links == null && queryMetadata == null) return xmlString

        val xmlInput = InputSource(StringReader(xmlString))
        val dbf = DocumentBuilderFactory.newInstance()
        val doc = dbf.newDocumentBuilder().parse(xmlInput)
        val wrapper = doc.getElementsByTagName("datasets")
        val wrapperElement = wrapper.item(0) as Element

        if(queryMetadata != null) {
            wrapperElement.setAttribute("numberReturned", queryMetadata.numberReturned.toString())
            wrapperElement.setAttribute("numberMatched", queryMetadata.numberMatched.toString())
            wrapperElement.setAttribute("timeStamp", queryMetadata.timeStamp.toString())
        }

        if(links != null){
            val xmlLinks = links.filter { it.type == "text/xml"}
            val selfLink =  (xmlLinks.find { it.rel == "self" })?.href
            val collectionLink = (links.find { it.rel == "collection" })?.href
            val prevLink = (xmlLinks.find { it.rel == "prev" })?.href
            val nextLink =  (xmlLinks.find { it.rel == "next" })?.href

            if (selfLink != null) wrapperElement.setAttribute("self", selfLink)
            if (collectionLink != null) wrapperElement.setAttribute("collection", collectionLink)
            if (prevLink != null) wrapperElement.setAttribute("prev", prevLink)
            if (nextLink != null) wrapperElement.setAttribute("next", nextLink)

            val alternateLinks = links.filter { it.rel == "alternate"}
            val alternates: MutableList<String> = mutableListOf()
            for (alternate in alternateLinks) alternates.add(alternate.href)
            wrapperElement.setAttribute("alternate", alternates.toString())
        }

        return xmlNodeToString(doc)
    }

    private fun wrapperForHtml(responseRecords: String, links: List<Link>?, queryMetadata: QueryMetadata?): String{
        var metadata =""
        var linksElements = ""
        var selfLink = ""

        if(queryMetadata != null) {
            val numberMatched = queryMetadata.numberMatched
            val numberReturned = queryMetadata.numberReturned
            val timeStamp = queryMetadata.timeStamp
            metadata += """
                <p>numberMatched: $numberMatched</p>
                <p>numberReturned: $numberReturned</p>
                <p>timeStamp: $timeStamp</p>
            """.trimIndent()
        }

        if(links != null) {
            val selfLinks = links.filter { it.rel == "self"}
            val alternateLinks = links.filter { it.rel == "alternate"}
            val nextLinks = links.filter { it.rel == "next"}
            val prevLinks = links.filter { it.rel == "prev"}
            val collectionLinks = links.filter { it.rel == "collection"}

            for(link in selfLinks) selfLink += "<p>" + link.title + ": " + link.href + "</p>"

            var htmlCollection = "<div class='grid-item dropdown'><div class='dropdownTitle'>Links to Collection</div><nav class=\"dropdown-content\">"
            for(link in collectionLinks) htmlCollection += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlCollection += "</nav></div>"

            var htmlAlternate = "<div class='grid-item dropdown'><div class='dropdownTitle'>Alternate Formats</div><nav class=\"dropdown-content\">"
            for(link in alternateLinks) htmlAlternate += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlAlternate += "</nav></div>"

            var htmlNext = "<div class='grid-item dropdown'><div class='dropdownTitle'>Next Page</div><nav class=\"dropdown-content\">"
            for(link in nextLinks) htmlNext += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlNext += "</nav></div>"

            var htmlPrev = "<div class='grid-item dropdown'><div class='dropdownTitle'>Previous Page</div><nav class=\"dropdown-content\">"
            for(link in prevLinks) htmlPrev += "<a href=" + link.href + ">" + link.title + "</a>"
            htmlPrev += "</nav></div>"

            linksElements += htmlAlternate + htmlCollection + htmlPrev + htmlNext
        }

        return """
            <html>
                <head><title>Ingrid - OGC Record API</title></head>
            <body>
            <header>
                <h1>OGC Record API</h1>
                $selfLink
                $metadata
                <div class="grid-container">
                    $linksElements
                </div>
            </header>
            $responseRecords
             <style>
                header {
                    background: #28225b;
                    color: #ffffff;
                    padding: 10px;
                }
                header a{
                    color: #ffffff
                }
                .grid-container {
                    display: grid;
                    gap: 10px;
                    grid-template-columns: auto auto auto auto;
                    padding: 10px;
                }
                .grid-item {
                }
                .dropdownTitle{
                    width: 100%;
                }
                .dropdown { 
                    display: inline-block; 
                    position: relative; 
                } 
                .dropdown-content {
                    display: none;
                    position: absolute;
                    width: 100%;
                    overflow: auto;
                    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
                }
                .dropdown:hover .dropdown-content {
                    display: block;
                }
                .dropdown-content a {
                    display: block;
                  color: #000000;
                  background-color: #ffffff;
                  padding: 5px;
                  text-decoration: none;
              }
              .dropdown-content a:hover {
                  color: #FFFFFF;
                  background-color: #196ea2;
              }
          </style>
          </body></html>
        """.trimIndent()
    }

    fun validateCollection(collectionId: String){
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")
    }

    fun validateRequestParams(allRequestParams: Map<String, String>, validParams: List<String>){
        for(param in allRequestParams.keys){
            if(param !in validParams) throw ClientException.withReason("Request parameter '$param' not supported")
        }
    }

    fun validateParamFormat(format: String){
        val supported: Boolean = supportedExportFormats.any { it == format}
        if(!supported) throw ClientException.withReason("Format '$format' not supported")
    }

    fun validateBbox(bbox: List<Float>?){
        if(bbox == null) return
        // http://localhost:8550/collections/ogctestkatalog/items?bbox=49.738177,8.176039,50.288841,9.340528

        // verify 4 values
        val size = bbox.size
        if( size != 4) throw ServerException.withReason("Bbox Error: Bbox must have 4 values; found $size values")

        val array = bbox.chunked(2) { it[0] to it[1] }

        // verify long and lat format
        for(coordinate in array) {
            // check if longitude is in range of -180 to 180
            if(abs(coordinate.first) > 180) throw ClientException.withReason("Bbox Error: Value '${coordinate.first}' does not represent a longitude.")
            // check if latitude is in range of -90 to 90
            if(abs(coordinate.second) > 90) throw ClientException.withReason("Bbox Error: Value '${coordinate.second}' does not represent a latitude.")
        }

        // verify valid bbox
        val long1 = array[0].first //bbox[0]
        val lat1 = array[0].second //bbox[1]
        val long2 = array[1].first //bbox[2]
        val lat2 = array[1].second //bbox[3]
        if(long1 > long2 && lat1 > lat2 ) throw ClientException.withReason("Bbox Error: Wrong order of bbox values.")
    }


}