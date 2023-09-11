package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.exporter.model.AddressModel.Companion.documentService
import de.ingrid.igeserver.imports.ImporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import java.security.Principal
import java.time.Instant



@Service
class OgcRecordService @Autowired constructor(
        private val catalogService: CatalogService,
        private val exportService: ExportService,
        private val importerFactory: ImporterFactory,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory
) {
    val apiHost = "http://localhost:8550"

    fun prepareDataForImport(mimeType: String, docData: String, catalogId: String): List<JsonNode>{
        val jsonDataList = mutableListOf<JsonNode>()
        val responsibleImporter = importerFactory.getImporter(mimeType, docData)
        for(importer in responsibleImporter) {
            jsonDataList.add(importer.run(catalogId, docData))
        }
        return jsonDataList
//        val responsibleImporter = importerFactory.getImporter(mimeType, docData)
//        return responsibleImporter[0].run(catalogId, docData)
    }
    fun responseHeaders(format: String?, links: List<String>? ): HttpHeaders{
        val responseHeaders = HttpHeaders()
        // add response format
        if (format == "internal" || format.isNullOrBlank()) responseHeaders.add("Content-Type", "application/json")
        if (format == "html") responseHeaders.add("Content-Type", "text/html")
        // add next, previous & self links
        if(!links.isNullOrEmpty()) {
            for (link in links) {
                responseHeaders.add("Link", link)
            }
        }
        return responseHeaders
    }
    fun ogcDateTimeConverter(datetime: String): List<String>{
        val dateArray = datetime.split("/") // listOf(datetime)
        var dateList = dateArray.map { date ->  if (date == "..") null else checkDatetime(date) }
        return dateArray
    }
    fun checkDatetime(date: String): String{
        val instance: Instant
        try {
            instance = Instant.parse(date)
        }
        catch (ex: AccessDeniedException){
            throw ClientException.withReason("Malformed request syntax of DateTime:  $date")            // how to throw correct error ?
        }

        return instance.toString()
    }

    fun buildRecordsQuery(queryLimit: Int, queryOffset: Int, type: List<String>?,  bbox: List<Float>?,  datetime: String? ): ResearchQuery{
        val clausesList: MutableList<BoolFilter> = mutableListOf()
        // filter: exclude FOLDERS
        clausesList.add( BoolFilter("OR", listOf("document_wrapper.type != 'FOLDER'"), null, null, true) )
        // bbox // check if 4 values is true
        if (bbox != null) {
            val boundingBox = bbox.map { coordinate ->  coordinate.toString()}
            clausesList.add( BoolFilter("OR", listOf("ingridSelectSpatial"), null, boundingBox, true) )
        }
        // time span
        if (datetime != null) {
            val dateList = ogcDateTimeConverter(datetime)
            clausesList.add( BoolFilter("OR", listOf("selectTimespan"), null, dateList, true) )
        }
        // filter by doc type
        if (type != null) {
            val typeList = mutableListOf<String>()
            for (name in type){
                typeList.add("document_wrapper.type = '${name}'")
            }
            clausesList.add( BoolFilter("OR", typeList, null, null, false) )
        }
        // prepare paging
//        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)

        // prepare query
        return ResearchQuery(
                term = null,
                clauses = BoolFilter(op="AND", value=null, clauses = clausesList, parameter=null, isFacet=true ),
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
        val queryOffset: Int = if (offset === null) 0 else { if ( offset < 0 ) 0 else offset }
        return LimitAndOffset(queryLimit, queryOffset)
    }

    fun getLinksForRecords(offset: Int?, limit: Int?, totalHits: Int, catalogId: String): List<Link>{ // HttpHeaders {
        val list: MutableList<Link> = mutableListOf()

        val (queryLimit, queryOffset) = pageLimitAndOffset(offset, limit)

        val nextOffset: Int = queryOffset + queryLimit
        val prevOffset: Int = if (queryOffset < queryLimit) 0 else queryOffset - queryLimit

        val baseUrl = "${apiHost}/collections/${catalogId}"
        val limitString = if (limit !== null) "?limit=${queryLimit}" else ""
        val questionMarkOrAmpersand = ( if (limit == null && offset !== null) "?" else if (limit !== null && offset !== null) "&" else "")


        val collectionLink = baseUrl
        list.add(createLink(collectionLink, "collection", "application/geo+json", "Link to this response"))

        val selfLink = baseUrl + "/items" + limitString + questionMarkOrAmpersand + ( if (offset !== null) "offset=${queryOffset}" else "" )
        list.add(createLink(selfLink, "self", "application/geo+json", "Link to this response"))

        if(totalHits > nextOffset){
            val nextLink = baseUrl + "/items" + (if ( limitString.isEmpty() ) "?" else "$limitString&") + "offset=$nextOffset"
            list.add(createLink(nextLink, "next", "application/geo+json", "Link to this response"))
        }

        if(queryOffset != 0) {
            val prevLink = baseUrl + "/items" + (if ( limitString.isEmpty() ) "?" else "$limitString&") + "offset=$prevOffset"
            list.add(createLink(prevLink, "prev", "application/geo+json", "Link to this response"))
        }



        return list
//        val responseHeaders = HttpHeaders()
//        responseHeaders.add("Link", selfLink)
//        if(totalHits > nextOffset) responseHeaders.add("Link", nextLink)
//        if(queryOffset != 0) responseHeaders.add("Link", prevLink)
//
//        return responseHeaders
    }

    private fun createLink(url: String, rel:String, type: String, title: String): Link{
        return Link(
                href = url,
                rel = rel,
                type = type,
                title = title
        )
    }

    fun getCatalogs(principal: Principal): List<RecordCollection> {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)
        return catalogs.map{ catalog -> mapCatalogToRecordCollection(catalog) }
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

    fun queryRecord(catalogId: String, wrapperId: Int, format: String?, draft: Boolean?): Pair<ByteArray, MediaType> {
        val options = ExportRequestParameter(
                id = wrapperId,
                exportFormat = format ?: "internal",
                useDraft = draft ?: false
        )
        val record = exportService.export(catalogId, options)
        val mimeType = record.exportFormat


        val preparedRecord = record.result // prepareRecordExport(record, options)

        return Pair(preparedRecord, mimeType)
    }


    private fun prepareRecordExport(record: ExportResult, options: ExportRequestParameter): ByteArray{
        val convertedRecord: ByteArray  = if (options.exportFormat == "internal"){
            val jsonNode = jacksonObjectMapper().readValue(record.result, JsonNode::class.java)
            val dataset = if (options.useDraft) jsonNode.get("resources").get("draft") else jsonNode.get("resources").get("published")
//            val dataset = jsonNode
            dataset.toString().toByteArray()
        } else {
            record.result
        }
        return convertedRecord
    }


    fun transformRecords(records: ResearchResponse, catalogId: String): List<Record>{
        return records.hits.map{ record -> mapRecordFields(record, catalogId)}
    }

    private fun mapRecordFields(record: Result, catalogId: String): Record {
        //val dataset =  "${apiHost}/collections/${catalogId}/items/${record._uuid}"
        val wrapper = documentService!!.getWrapperByCatalogAndDocumentUuid(catalogId, record._uuid!!)
        val id = wrapper.id!!

        val options = ExportRequestParameter(
                id = id,
                exportFormat = "internal",
                useDraft = false
        )
        val exportedData = exportService.export(catalogId, options)

        val jsonNode = jacksonObjectMapper().readValue(exportedData.result, JsonNode::class.java)
        val publishedData = if (options.useDraft) jsonNode.get("resources").get("draft") else jsonNode.get("resources").get("published")
        val dataset = ObjectMapper().convertValue<JsonNode>(publishedData)


        val geometry: MutableList<JsonNode> = mutableListOf()
        val interval: MutableList<String> = mutableListOf()
        interval.add("..") // start date
        interval.add("..") // end date
        val time = RecordTime( interval, resolution = "P1D" )

//        return dataset
        return Record(
                id = dataset.get("_uuid"),
                conformsTo = null,
                type = "Feature",
                time,
                geometry,
                properties = dataset,
        )
    }

}