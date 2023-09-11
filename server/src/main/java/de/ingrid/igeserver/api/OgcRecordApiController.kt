package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.Instant
import java.util.*

@RestController
//@RequestMapping(path = ["/api"])
class OgcRecordApiController @Autowired constructor(
        private val catalogService: CatalogService,
        private val documentService: DocumentService,
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val importService: ImportService,
        val scheduler: SchedulerService,
        ) : OgcRecordApi {

    val log = logger()

    override fun catalogs(principal: Principal, format: String?): ResponseEntity<List<RecordCollection>> {
        val catalogs = ogcRecordService.getCatalogs(principal)
//        val exporter = ogcCatalogExporterFactory.getExporter(format ?: "internal")
//        val catalog = exporter.run(catalogData)
        return ResponseEntity.ok().body(catalogs.toList())
    }

    override fun catalogById(collectionId: String, format: String?): ResponseEntity<ByteArray> {


        val catalogData = catalogService.getCatalogById(collectionId)
        val exporter = ogcCatalogExporterFactory.getExporter(format ?: "internal")

        val catalog = ogcRecordService.getCatalogById(collectionId, exporter)
        val response = catalog.toString().toByteArray()

//        val catalog = exporter.run(catalogData)
        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

//        val responseHeaders = ogcRecordService.responseHeaders(format, null)
        return ResponseEntity.ok().headers(responseHeaders).body(response)
    }


    override fun deleteDataset(principal: Principal, collectionId: String, recordId: String): ResponseEntity<Void> {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        wrapper.id?.let {
            documentService.deleteDocument(principal, collectionId, it)
        }
        return ResponseEntity.ok().build()
    }


    override fun createDataset(allHeaders: Map<String, String>, principal: Principal, collectionId: String, data: String, address: Boolean, publish: Boolean): ResponseEntity<JsonNode> {
        val contentType = allHeaders["content-type"]!!
//        val importerInfo = importService.getImporterInfos()

        var jsonDataList: List<JsonNode> = ogcRecordService.prepareDataForImport(contentType, data, collectionId)

//        for(preparedImportData in jsonDataList) {
//            val contactDocs: JsonNode = preparedImportData.get("pointOfContact")
//            for( contact in contactDocs){
//                val currentAddress = true
//                val contactData = contact.get("ref")
//                val parentId = null
//                documentService.createDocument(principal, collectionId, contactData, parentId, currentAddress, publish)
//            }
//
//            val parent = preparedImportData.get(FIELD_PARENT) //data.get(FIELD_RESOURCES).get(FIELD_PARENT)
////        val parentId = if (parent == null || parent.isNull ) null else parent.asInt()
//            val parentId = null
////         val data  = data.get(FIELD_RESOURCES).get(FIELD_PUBLISHED)
//            val resultDoc = documentService.createDocument(principal, collectionId, preparedImportData, parentId, address, publish)
//            // addMetadataToDocument(resultDoc)

//        }


//        val node = documentService.convertToJsonNode(resultDoc.document)
//        return ResponseEntity.ok(node)
        return ResponseEntity.ok().build()
    }



    override fun updateDataset(
            principal: Principal,
            collectionId: String,
            recordId: String,
            data: JsonNode,
            publishDate: Date?,
            publish: Boolean,
            format: String?,
    ): ResponseEntity<JsonNode> {

        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val wrapperId = wrapper.id!!

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (publish) {
            val doc = documentService.convertToDocument(data)
            documentService.publishDocument(principal, catalogId, wrapperId, doc, publishDate)
        } else {
            val doc = documentService.convertToDocument(data)
            documentService.updateDocument(principal, catalogId, wrapperId, doc)
        }

        val node = documentService.convertToJsonNode(resultDoc.document)
        return ResponseEntity.ok(node)
    }


    override fun getRecord(collectionId: String, recordId: String, format: String?, draft: Boolean?): ResponseEntity<ByteArray> {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val wrapperId = wrapper.id!!

        val record = ogcRecordService.queryRecord(collectionId, wrapperId, format, draft)

//        val responseHeaders = ogcRecordService.responseHeaders(format, null)

        val mimeType = record.second.toString()
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record.first)
    }


    override fun getRecords(collectionId: String, limit: Int?, offset: Int?, type: List<String>?, bbox: List<Float>?, datetime: String?, q: List<String>?, externalid: List<String>?, format: String?, filter: String? ): ResponseEntity<RecordsResponse> {

        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)

        // create research query
        val query = ogcRecordService.buildRecordsQuery(queryLimit, queryOffset, type, bbox, datetime)
        // research query
        val records: ResearchResponse = researchService.query(collectionId, query)
        // query all record details
        val transformedRecords = ogcRecordService.transformRecords(records, collectionId)

        // header
        val totalHits = records.totalHits
        val links: List<Link> = ogcRecordService.getLinksForRecords(offset, limit, totalHits, collectionId)

        val response = RecordsResponse(
                type = "FeatureCollection",
                timeStamp = Instant.now(),
                numberReturned = transformedRecords.size,
                numberMatched = totalHits,
                features = transformedRecords,
                links = links
        )

        val responseHeaders = ogcRecordService.responseHeaders(null, null)
        return ResponseEntity.ok().headers(responseHeaders).body(response)
    }

}