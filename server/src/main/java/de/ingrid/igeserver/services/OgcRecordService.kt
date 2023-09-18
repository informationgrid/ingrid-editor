package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.exporter.model.AddressModel.Companion.documentService
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.imports.ImporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.stereotype.Service
import org.w3c.dom.Node
import org.xml.sax.InputSource
import java.io.StringReader
import java.io.StringWriter
import java.security.Principal
import java.time.Instant
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.dom.DOMSource
import javax.xml.transform.stream.StreamResult


data class XmlMetadata(
        var dataset: List<Metadata>,
)

@Service
class OgcRecordService @Autowired constructor(
        private val catalogService: CatalogService,
        private val exportService: ExportService,
        private val importerFactory: ImporterFactory,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val internalExporter: InternalExporter,
) {
    val apiHost = "http://localhost:8550"

    fun prepareDataForImport(catalogId: String, mimeType: String, docData: String, publish: Boolean): List<String> {
        val documents: MutableList<String> = mutableListOf()
        if (mimeType == "application/xml") {
            val parsedXml = parseXmlWithMultipleDocs(docData, catalogId)
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
                    val internalDoc = internalExporter.addExportWrapper(catalogId, doc, null)
                    documents.add(internalDoc.toString())
                }
                if (jsonFormat == "geojson") {
                    val relevantNode = doc.get("properties")
                    val geoJsonDoc = internalExporter.addExportWrapper(catalogId, relevantNode, null)
                    documents.add(geoJsonDoc.toString())
                }
            }
        }
        return documents
    }

    private fun parseXmlWithMultipleDocs(data: String, catalogId: String): List<String> {
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
    private fun xmlNodeToString(newDoc: Node): String {
        val domSource = DOMSource(newDoc)
        val transformer: Transformer = TransformerFactory.newInstance().newTransformer()
        val sw = StringWriter()
        val sr = StreamResult(sw)
        transformer.transform(domSource, sr)
        return sw.toString()
    }

    fun responseHeaders(format: String?, links: List<String>?): HttpHeaders {
        val responseHeaders = HttpHeaders()
        // add response format
        if (format == "internal" || format == "geojson" || format.isNullOrBlank()) responseHeaders.add("Content-Type", "application/json")
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
        clausesList.add(BoolFilter("OR", listOf("document_wrapper.type != 'FOLDER'"), null, null, true))
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
        val maxLimit = Int.MAX_VALUE
        var queryLimit: Int = limit ?: defaultLimit
        if (queryLimit > maxLimit) queryLimit = maxLimit
        val queryOffset: Int = if (offset === null) 0 else {
            if (offset < 0) 0 else offset
        }
        return LimitAndOffset(queryLimit, queryOffset)
    }

    fun getLinksForRecords(offset: Int?, limit: Int?, totalHits: Int, catalogId: String): List<Link> { // HttpHeaders {
        val list: MutableList<Link> = mutableListOf()

        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)

        val nextOffset: Int = queryOffset + queryLimit
        val prevOffset: Int = if (queryOffset < queryLimit) 0 else queryOffset - queryLimit

        val baseUrl = "${apiHost}/collections/${catalogId}"
        val limitString = if (limit !== null) "?limit=${queryLimit}" else ""
        val questionMarkOrAmpersand = (if (limit == null && offset !== null) "?" else if (limit !== null && offset !== null) "&" else "")


        val collectionLink = baseUrl
        list.add(createLink(collectionLink, "collection", "application/geo+json", "Link to this response"))

        val selfLink = baseUrl + "/items" + limitString + questionMarkOrAmpersand + (if (offset !== null) "offset=${queryOffset}" else "")
        list.add(createLink(selfLink, "self", "application/geo+json", "Link to this response"))

        if (totalHits > nextOffset) {
            val nextLink = baseUrl + "/items" + (if (limitString.isEmpty()) "?" else "$limitString&") + "offset=$nextOffset"
            list.add(createLink(nextLink, "next", "application/geo+json", "Link to next records"))
        }

        if (queryOffset != 0) {
            val prevLink = baseUrl + "/items" + (if (limitString.isEmpty()) "?" else "$limitString&") + "offset=$prevOffset"
            list.add(createLink(prevLink, "prev", "application/geo+json", "Link to previous records"))
        }

        return list
//        val responseHeaders = HttpHeaders()
//        responseHeaders.add("Link", selfLink)
//        if(totalHits > nextOffset) responseHeaders.add("Link", nextLink)
//        if(queryOffset != 0) responseHeaders.add("Link", prevLink)
//
//        return responseHeaders
    }

    private fun createLink(url: String, rel: String, type: String, title: String): Link {
        return Link(
                href = url,
                rel = rel,
                type = type,
                title = title
        )
    }

    fun getCatalogs(principal: Principal): List<RecordCollection> {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)
        return catalogs.map { catalog -> mapCatalogToRecordCollection(catalog) }
    }

    fun getCatalogById(collectionId: String, exporter: OgcCatalogExporter): Any {
        val catalogData = catalogService.getCatalogById(collectionId)
//        val exporter = ogcCatalogExporterFactory.getExporter(format ?: "internal")
//        val mimeType = "application/" + exporter.typeInfo.fileExtension
        return exporter.run(catalogData)

//        val catalog = catalogService.getCatalogById(catalogId)
//        return mapCatalogToRecordCollection(catalog)
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

    fun prepareRecord(catalogId: String, recordId: String, wrapperId: Int, format: String?, draft: Boolean?): Pair<ByteArray, String> {
        val record = exportRecord(recordId, catalogId, format, draft)
        val mimeType = record.exportFormat.toString()

        val recordList: List<ExportResult> = listOf(record)
        val unwrappedRecord = removeDefaultWrapper(mimeType, recordList, format, draft)
        val wrappedRecord = addWrapperToRecords(unwrappedRecord, mimeType, format, null, null, true)

        return Pair(wrappedRecord, mimeType)
    }

    fun prepareRecords(records: ResearchResponse, catalogId: String, format: String?, mimeType: String, totalHits: Int, links: List<Link>, draft: Boolean?): ByteArray {
        val recordList: List<ExportResult> = records.hits.map { record -> exportRecord(record._uuid!!, catalogId, format, draft) }
        val unwrappedRecords = removeDefaultWrapper(mimeType, recordList, format, draft)
        return addWrapperToRecords(unwrappedRecords, mimeType, format, totalHits, links, false)
    }

    private fun removeDefaultWrapper(mimeType: String, recordList: List<ExportResult>, format: String?, draft: Boolean?): Any{
        return if (mimeType == "text/xml") {
            var response = ""
            for (record in recordList) response += record.result.toString(Charsets.UTF_8).substringAfter("?>")
            response
        } else if (mimeType == "application/json") {
            val response: MutableList<Any> = mutableListOf()
            for (record in recordList) {
                val mapper = jacksonObjectMapper()
                val wrapperlessRecord: Any = if(format == "internal"){
                    val jsonNode = mapper.readValue(record.result, JsonNode::class.java)
                    if (draft == true) jsonNode.get("resources").get("draft") else jsonNode.get("resources").get("published")
                } else {
                    mapper.readValue(record.result, Record::class.java)
                }
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
    private fun addWrapperToRecords(responseRecords: Any, mimeType: String, format: String?, totalHits: Int?, links: List<Link>?, singleRecord: Boolean?): ByteArray { // prepareWrappedResponse
        var wrappedResponse = ""

        if(mimeType == "text/html") wrappedResponse = "<html><head><title>Ingrid - OGC Record API</title></head><body>$responseRecords</body></html>"
        if(mimeType == "text/xml") wrappedResponse = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><datasets>$responseRecords</datasets>"
        if(mimeType == "application/json"){
            val jsonDocs = responseRecords as List<Any>
            if(format == "geojson") {
                if(singleRecord == true) {
                    val mapper = jacksonObjectMapper()
                    val resp = mapper.convertValue(responseRecords, JsonNode::class.java)
                    wrappedResponse = resp.toString()
                } else {
                    val response: Any = RecordsResponse(
                            type = "FeatureCollection",
                            timeStamp = Instant.now(),
                            numberReturned = jsonDocs.size,
                            numberMatched = totalHits as Int,
                            features = jsonDocs as List<Record>,
                            links = links
                    )
                    val jsonResponse = convertObject2Json(response)
                    wrappedResponse = jsonResponse.toString()
                }
            } else {
                // internal json format
                val recordArray = jacksonObjectMapper().createArrayNode()
                for( record in jsonDocs as List<JsonNode>) recordArray.add(convertObject2Json(record))
                wrappedResponse = recordArray.toString()
            }
        }
        return wrappedResponse.toByteArray()
    }

    private fun exportRecord(recordId: String, catalogId: String, format: String?, draft: Boolean?): ExportResult {
        val wrapper = documentService!!.getWrapperByCatalogAndDocumentUuid(catalogId, recordId)
        val id = wrapper.id!!
        val options = ExportRequestParameter(
                id = id,
                exportFormat = format ?: "internal",
                useDraft = draft ?: false
        )
        return exportService.export(catalogId, options)
    }

    private fun convertObject2Json(dataClassObject: Any): ObjectNode{
        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())

        val node = mapper.convertValue(dataClassObject, ObjectNode::class.java)
        node.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node
    }

    //    private fun prepareJsonExport(record: ExportResult, format: String?, draft: Boolean?): Any {
//        val useDraft = draft ?: false
//        val exportFormat = format ?: "internal"
//        return if(exportFormat == "internal"){
//            val jsonNode = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
//            if (useDraft) jsonNode.get("resources").get("draft") else jsonNode.get("resources").get("published")
//        } else {
//            jacksonObjectMapper().readValue(record.result, Record::class.java)
//        }
//    }

}