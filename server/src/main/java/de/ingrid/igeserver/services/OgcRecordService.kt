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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.*
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exports.internal.InternalExporter
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.OgcHtmlConverterService
import de.ingrid.igeserver.ogc.api.CollectionFormat
import de.ingrid.igeserver.ogc.api.RecordFormat
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.keycloak.util.JsonSerialization
import org.springframework.context.annotation.Profile
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

data class LandingPageInfo(
    val title: String,
    val description: String,
    val links: List<Link>,
)

data class Conformance(
    val conformsTo: List<String>
)

data class ResponsePackage(
    val data: ByteArray,
    val mimeType: String
)

data class XmlMetadata(
    var dataset: List<Metadata>,
)
data class SupportFormat(
    var format: String,
    var mimeType: String,
)
data class QueryMetadata(
    var numberReturned: Int,
    var numberMatched: Int,
    var timeStamp: Instant?,
)

@Service
@Profile("ogc-api")
class OgcRecordService(
    private val catalogService: CatalogService,
    private val exportService: ExportService,
    private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
    private val internalExporter: InternalExporter,
    private val documentService: DocumentService,
    private val importService: ImportService,
    private val ogcHtmlConverterService: OgcHtmlConverterService,
    generalProperties: GeneralProperties,
) {
    val hostnameOgcApi = generalProperties.host + "/api/ogc"

    fun handleLandingPageRequest(requestedFormat: CollectionFormat): ResponsePackage {
        val linkList: MutableList<Link> = mutableListOf()

        linkList.add(Link(href = hostnameOgcApi, rel = "self", type = requestedFormat.mimeType, title = "This document"))
        CollectionFormat.entries
            .filter { it != requestedFormat }
            .forEach {
                linkList.add(
                    Link(href = "${hostnameOgcApi}?f=${it}", rel = "alternate", type = it.mimeType, title = "Link to the landing page in format '$it'")
                )
            }
        linkList.add(Link(href = "${hostnameOgcApi}/conformance", rel = "conformance", type = "application/json", title = "OGC API conformance classes implemented by this server"))
        linkList.add(Link(href = "${hostnameOgcApi}/collections", rel = "collections", type = "application/json", title = "Information about the record collections"))

        val info = LandingPageInfo(
            title = "InGrid Editor - OGC API Records",
            description = "Access to data of InGrid Editor via a Web API that conforms to the OGC API Records specification.",
            links = linkList
        )

        val responseByteArray = if (requestedFormat == CollectionFormat.html) {
            val infoAsObjectNode: ObjectNode = JsonSerialization.mapper.valueToTree(info)
            val html = ogcHtmlConverterService.convertObjectNode2Html(infoAsObjectNode, "Landing page")
            ogcHtmlConverterService.wrapperForHtml(html, null, null).toByteArray()
        } else {
            convertObject2Json(info).toString().toByteArray()
        }

        return ResponsePackage(
            data = responseByteArray,
            mimeType = requestedFormat.mimeType
        )
    }


    fun handleConformanceRequest(requestedFormat: CollectionFormat): ResponsePackage {
        val mimeType = requestedFormat.mimeType

        val conformance = Conformance(
            conformsTo = listOf(
                "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core",
                "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/html",
            )
        )

        val responseByteArray = if(requestedFormat == CollectionFormat.html) {
            val infoAsObjectNode: ObjectNode = JsonSerialization.mapper.valueToTree(conformance)
            val html = ogcHtmlConverterService.convertObjectNode2Html(infoAsObjectNode, "Conformance")
            ogcHtmlConverterService.wrapperForHtml(html, null, null).toByteArray()
        } else {
            convertObject2Json(conformance).toString().toByteArray()
        }

        return ResponsePackage(
            data = responseByteArray,
            mimeType = mimeType
        )
    }

    @Transactional
    fun transactionalImportDocuments(
        options: ImportOptions,
        collectionId: String,
        contentType: String,
        data: String,
        principal: Authentication,
        recordMustExist: Boolean,
        recordId: String?,
        profile: CatalogProfile
    ){
        importDocuments(options, collectionId, contentType, data, principal, recordMustExist, recordId, profile)
    }

    fun importDocuments(options: ImportOptions, collectionId: String, contentType: String, data: String, principal: Authentication, recordMustExist: Boolean, recordId: String?, profile: CatalogProfile){
        val docArray = prepareDataForImport(collectionId, contentType, data)
        for( doc in docArray ) {
            val optimizedImportAnalysis = importService.prepareImportAnalysis(profile, collectionId, contentType, doc)
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

    fun pageLimitAndOffset(offset: Int?, limit: Int?): LimitAndOffset {
        val defaultLimit = 10
        val minLimit = 1
        val maxLimit = Int.MAX_VALUE
        val queryLimit: Int = limit ?: defaultLimit
        if(queryLimit < minLimit || queryLimit > maxLimit) throw InvalidParameterException.withInvalidParameters("limit")
//        if (queryLimit > maxLimit) queryLimit = maxLimit
        val queryOffset: Int = if (offset == null) 0 else {
            if (offset < 0) 0 else offset
        }
        return LimitAndOffset(queryLimit, queryOffset)
    }

    fun getLinksForRecords(offset: Int?, limit: Int?, totalHits: Int, collectionId: String, requestedFormat: RecordFormat): List<Link> {
        val list: MutableList<Link> = mutableListOf()

        // prepare pageing numbers
        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)
        val nextOffset: Int = queryOffset + queryLimit
        val prevOffset: Int = if (queryOffset < queryLimit) 0 else queryOffset - queryLimit

        // prepare string fragments
        val baseUrl = "${hostnameOgcApi}/collections/${collectionId}"
        val recordBaseUrl = "$baseUrl/items?f="
        val limitString = if (limit != null) "&limit=${queryLimit}" else ""
        val selfOffsetString = if (offset != null) "&offset=${queryOffset}" else ""
        val prevOffsetString = "&offset=$prevOffset"
        val nextOffsetString = "&offset=$nextOffset"

        // add self Link to list
        RecordFormat.entries
            .filter { it == requestedFormat }
            .forEach {
                list.add(createLink(
                        url = recordBaseUrl + requestedFormat + limitString + selfOffsetString,
                        "self",
                        it.mimeType,
                        "Link to this response"
                ))
            }

        // add collection links in supported formats
        CollectionFormat.entries.forEach {
            val supportedFormat = it
            list.add(createLink(
                    url = "$baseUrl?f=$supportedFormat",
                    "collection",
                    it.mimeType,
                    "Link to the containing collection in format '$supportedFormat' "
            ))
        }

        // add alternate, next, previous links for each format
        RecordFormat.entries.forEach {
            val supportedFormat = it
            val mimeType = it.mimeType
            if (supportedFormat != requestedFormat) list.add(createLink(
                    url = recordBaseUrl + supportedFormat + limitString + selfOffsetString,
                    "alternate",
                    mimeType,
                    "Link to this response in format '$supportedFormat' "
            ))
            if (totalHits > nextOffset) list.add(createLink(
                    url = recordBaseUrl + supportedFormat + limitString + nextOffsetString,
                    "next",
                    mimeType,
                    "Link to the next set of records in format '$supportedFormat' "
            ))
            if (queryOffset != 0) list.add(createLink(
                    url = recordBaseUrl + supportedFormat + limitString + prevOffsetString,
                    "prev",
                    mimeType,
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
    fun prepareCatalog(collectionId: String, exporter: OgcCatalogExporter, format: CollectionFormat): ByteArray {
        val catalog = exportCatalog( collectionId, exporter)
        val catalogAsList = listOf(catalog)
        val editedCatalog = editCatalogs(exporter.typeInfo.dataType, catalogAsList, format)
        return addWrapperToCatalog(editedCatalog, exporter.typeInfo.dataType, format, null, true, null)
    }

    fun prepareCatalogs(principal: Principal, format: CollectionFormat): ByteArray {
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

    private fun editCatalogs(mimeType: String, catalogList: List<Any>, format: CollectionFormat): Any{
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
    private fun addWrapperToCatalog(catalog: Any, mimeType: String, format: CollectionFormat, links: List<Link>?, singleRecord: Boolean?, queryMetadata: QueryMetadata?): ByteArray {
        var wrappedResponse = ""
        if(mimeType == "text/html") wrappedResponse = ogcHtmlConverterService.wrapperForHtml(catalog as String, links, queryMetadata)
        if(mimeType == "text/xml") wrappedResponse = wrapperForXml(catalog as String, links, queryMetadata)
        if(mimeType == "application/json")  wrappedResponse = wrapperForJsonCatalog(catalog as List<JsonNode>, links, queryMetadata, singleRecord, format)
        return wrappedResponse.toByteArray()
    }

    private fun mapCatalogToRecordCollection(catalog: Catalog): RecordCollection {
        val links = "${hostnameOgcApi}/collections/${catalog.identifier}/items"
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

    fun prepareRecord(collectionId: String, recordId: String, format: RecordFormat): Pair<ByteArray, String> {
        val record = exportRecord(recordId, collectionId, format)
        val mimeType = record.exportFormat.toString()

        val singleRecordInList: List<ExportResult> = listOf(record)
        val unwrappedRecord = removeDefaultWrapper(mimeType, singleRecordInList, format)
        val wrappedRecord = addWrapperToRecords(unwrappedRecord, mimeType, format,  null, true, null)
        return Pair(wrappedRecord, mimeType)
    }

    fun prepareRecords(records: ResearchResponse, collectionId: String, format: RecordFormat, mimeType: String, links: List<Link>, queryMetadata: QueryMetadata): ByteArray {
        val recordList: List<ExportResult> = records.hits.map { record -> exportRecord(record._uuid!!, collectionId, format) }
        val unwrappedRecords = removeDefaultWrapper(mimeType, recordList, format)
        return addWrapperToRecords(unwrappedRecords, mimeType, format, links, false, queryMetadata)
    }

    private fun exportRecord(recordId: String, collectionId: String, format: RecordFormat): ExportResult {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val id = wrapper.id!!
        val exportFormat = if(format == RecordFormat.json) "internal" else format.toString()
        val options = ExportRequestParameter(
                id = id,
                exportFormat = exportFormat,
                // TODO context of ingridISO exporter: check why address documents need to called as drafts
                useDraft = (format == RecordFormat.ingridISO && wrapper.category == "address")
        )
        return exportService.export(collectionId, options)
    }


    private fun removeDefaultWrapper(mimeType: String, recordList: List<ExportResult>, format: RecordFormat): Any{
        return if (mimeType == "text/xml") {
            var response = ""
            for (record in recordList) response += record.result.toString(Charsets.UTF_8).substringAfter("?>")
            response
        } else if (mimeType == "application/json") {
            val response: MutableList<JsonNode> = mutableListOf()
            for (record in recordList) {
                var wrapperlessRecord = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
                if(format == RecordFormat.json) wrapperlessRecord = wrapperlessRecord.get("resources").get("published")
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
    private fun addWrapperToRecords(responseRecords: Any, mimeType: String, format: RecordFormat, links: List<Link>?, singleRecord: Boolean?, queryMetadata: QueryMetadata?): ByteArray {
        var wrappedResponse = ""
        if(mimeType == "text/html") wrappedResponse = ogcHtmlConverterService.wrapperForHtml(responseRecords as String, links, queryMetadata)
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

    private fun wrapperForJsonCatalog(responseCatalogs: List<JsonNode>, links: List<Link>?, queryMetadata: QueryMetadata?, singleRecord: Boolean?, format: CollectionFormat): String {
        val mapper = jacksonObjectMapper()
        val recordArray = mapper.createArrayNode()
        responseCatalogs.forEach { recordArray.add(convertObject2Json(it)) }
//        for( record in responseRecords) recordArray.add(convertObject2Json(record))
        return recordArray.toString()
    }

    private fun wrapperForJson(responseRecords: List<JsonNode>, links: List<Link>?, queryMetadata: QueryMetadata?, singleRecord: Boolean?, format: RecordFormat): String {
        val wrappedResponse: JsonNode
        val mapper = jacksonObjectMapper()
        if(format == RecordFormat.geojson && singleRecord == true) {
                wrappedResponse = mapper.convertValue(responseRecords, JsonNode::class.java)
        } else if(format == RecordFormat.geojson && singleRecord == false) {
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


}
