package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.CswtService
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.util.*
import org.springframework.security.core.Authentication
import java.time.Instant

@RestController
//@RequestMapping(path = ["/api"])
class OgcRecordApiController @Autowired constructor(
        private val catalogService: CatalogService,
        private val documentService: DocumentService,
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val exporterFactory: ExporterFactory,
        private val cswtService: CswtService,
        val scheduler: SchedulerService,
        ) : OgcRecordApi {

    val log = logger()
    val defaultFormat = "geojson"

    override fun getCatalogs(principal: Principal, format: String?): ResponseEntity<ByteArray> {
        val definedFormat = format ?: defaultFormat
        ogcRecordService.checkFormatSupport(definedFormat)
        val exporter = ogcCatalogExporterFactory.getExporter(definedFormat)
        val catalogs = ogcRecordService.prepareCatalogs(principal, definedFormat)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalogs)
    }

    override fun getCatalog(collectionId: String, format: String?): ResponseEntity<ByteArray> {
        val definedFormat = format ?: defaultFormat
        ogcRecordService.checkFormatSupport(definedFormat)

        val exporter = ogcCatalogExporterFactory.getExporter(definedFormat)

        val catalog = ogcRecordService.prepareCatalog(collectionId, exporter, definedFormat)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalog)
    }


    override fun deleteDataset(principal: Principal, collectionId: String, recordId: String): ResponseEntity<Void> {
        ogcRecordService.deleteRecord(principal, collectionId, recordId)
        return ResponseEntity.ok().build()
    }

    override fun postDataset(allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, address: Boolean, publish: Boolean?): ResponseEntity<JsonNode> {
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")

        val contentType = allHeaders["content-type"]!!
        // import via importer
        val options = ImportOptions( publish = publish ?: false)
        ogcRecordService.importDocuments(options, collectionId, contentType, data, principal, recordMustExist = false, null)
        return ResponseEntity.ok().build()
    }


    override fun putDataset(allHeaders: Map<String, String>, principal: Authentication, collectionId: String, recordId: String, data: String, publishDate: Date?, publish: Boolean? ): ResponseEntity<JsonNode> {
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")

        val contentType = allHeaders["content-type"]!!
//        // check if document exists
//        documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        // import via importer
        val options = ImportOptions( publish = publish ?: true , overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.importDocuments(options, collectionId, contentType, data, principal, recordMustExist = true, recordId)
        return ResponseEntity.ok().build()
    }

    override fun getRecord(collectionId: String, recordId: String, format: String?): ResponseEntity<ByteArray> {
        val definedFormat = format ?: defaultFormat

        val record = ogcRecordService.prepareRecord(collectionId, recordId, definedFormat)

        val mimeType = record.second
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record.first)
    }


    override fun getRecords(collectionId: String, limit: Int?, offset: Int?, type: List<String>?, bbox: List<Float>?, datetime: String?, q: List<String>?, externalid: List<String>?, format: String?, filter: String? ): ResponseEntity<ByteArray> {
        if(!catalogService.catalogExists(collectionId)) throw NotFoundException.withMissingResource(collectionId, "Collection")
        ogcRecordService.verifyBbox(bbox)
        val definedFormat = format ?: defaultFormat

        val exporter = exporterFactory.getExporter(DocumentCategory.DATA, format = definedFormat)
        val mimeType: String = exporter.typeInfo.dataType

        // create research query
        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)
        val query = ogcRecordService.buildRecordsQuery(queryLimit, queryOffset, type, bbox, datetime)
        val researchRecords: ResearchResponse = researchService.query(collectionId, query)

        // links: next previous self
        val totalHits = researchRecords.totalHits
        val links: List<Link> = ogcRecordService.getLinksForRecords(offset, limit, totalHits, collectionId, definedFormat)
        val queryMetadata = QueryMetadata(
                numberReturned = if(totalHits < queryLimit) totalHits else queryLimit,
                numberMatched = totalHits,
                Instant.now()
        )
        // query all record details in right response format via exporter
        val records: ByteArray = ogcRecordService.prepareRecords(researchRecords, collectionId, definedFormat, mimeType, links, queryMetadata)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(records)
    }


    override fun handleCSWT(allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String): ResponseEntity<ByteArray> {
        val options = ImportOptions(publish = true , overwriteAddresses = true, overwriteDatasets = true)
        cswtService.cswTransaction(data, collectionId, principal, options)
//        cswtService.prepareCSWT(principal, collectionId, data)
        return ResponseEntity.ok().build()
    }
}