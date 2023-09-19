package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExporterFactory
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
import java.util.*
import org.springframework.security.core.Authentication

@RestController
//@RequestMapping(path = ["/api"])
class OgcRecordApiController @Autowired constructor(
        private val catalogService: CatalogService,
        private val documentService: DocumentService,
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val exporterFactory: ExporterFactory,
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

    override fun postDataset(allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, address: Boolean, publish: Boolean?): ResponseEntity<JsonNode> {
        val contentType = allHeaders["content-type"]!!
        // import via importer
        val options = ImportOptions( publish = publish ?: false)
        ogcRecordService.importDocuments(options, collectionId, contentType, data, principal)
        return ResponseEntity.ok().build()
    }

    override fun putDataset(allHeaders: Map<String, String>, principal: Authentication, collectionId: String, recordId: String, data: String, publishDate: Date?, publish: Boolean? ): ResponseEntity<JsonNode> {
        val contentType = allHeaders["content-type"]!!
        // check if document exists
        documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        // import via importer
        val options = ImportOptions( publish = publish ?: true , overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.importDocuments(options, collectionId, contentType, data, principal)
        return ResponseEntity.ok().build()
    }

    override fun getRecord(collectionId: String, recordId: String, format: String?, draft: Boolean?): ResponseEntity<ByteArray> {
        val record = ogcRecordService.prepareRecord(collectionId, recordId, format, draft)

        val mimeType = record.second
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record.first)
    }


    override fun getRecords(collectionId: String, limit: Int?, offset: Int?, type: List<String>?, bbox: List<Float>?, datetime: String?, q: List<String>?, externalid: List<String>?, format: String?, filter: String?, draft: Boolean? ): ResponseEntity<ByteArray> {
        val formatType = format ?: "internal"

        val exporter = exporterFactory.getExporter(DocumentCategory.DATA, format = formatType)
        val mimeType: String = exporter.typeInfo.dataType

        // create research query
        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)
        val query = ogcRecordService.buildRecordsQuery(queryLimit, queryOffset, type, bbox, datetime)
        val researchRecords: ResearchResponse = researchService.query(collectionId, query)

        // links: next previous self
        val totalHits = researchRecords.totalHits
        val links: List<Link> = ogcRecordService.getLinksForRecords(offset, limit, totalHits, collectionId, format)

        // query all record details in right response format via exporter
        val records: ByteArray = ogcRecordService.prepareRecords(researchRecords, collectionId, format, mimeType, totalHits, links, draft)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(records)
    }

}