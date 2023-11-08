package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.ogc.OgcCswtService
import de.ingrid.igeserver.ogc.cswt.CSWTransactionResult
import de.ingrid.igeserver.services.*
import de.ingrid.utils.IngridDocument
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import org.springframework.security.core.Authentication
import java.time.Instant
import de.ingrid.igeserver.IgeException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode

@RestController
@RequestMapping(path = ["/api/ogc"])
class OgcApiRecordsController @Autowired constructor(
        private val catalogService: CatalogService,
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val exporterFactory: ExporterFactory,
        private val ogcCswtService: OgcCswtService,
        private val documentService: DocumentService,
        val scheduler: SchedulerService,
        ) : OgcApiRecords {

    val log = logger()
    val defaultFormat = "internal"


    override fun getCatalogs(allRequestParams: Map<String, String>, principal: Principal, format: String?): ResponseEntity<ByteArray> {
        ogcRecordService.validateRequestParams(allRequestParams, listOf("f"))
        val definedFormat = format ?: defaultFormat
        ogcRecordService.validateParamFormat(definedFormat)

        val exporter = ogcCatalogExporterFactory.getExporter(definedFormat)
        val catalogs = ogcRecordService.prepareCatalogs(principal, definedFormat)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalogs)
    }

    override fun getCatalog(allRequestParams: Map<String, String>, collectionId: String, format: String?): ResponseEntity<ByteArray> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf("f"))
        val definedFormat = format ?: defaultFormat
        ogcRecordService.validateParamFormat(definedFormat)

        val exporter = ogcCatalogExporterFactory.getExporter(definedFormat)

        val catalog = ogcRecordService.prepareCatalog(collectionId, exporter, definedFormat)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalog)
    }


    override fun deleteDataset(allRequestParams: Map<String, String>, principal: Principal, collectionId: String, recordId: String): ResponseEntity<Void> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf())
        ogcRecordService.deleteRecord(principal, collectionId, recordId)
        return ResponseEntity.ok().build()
    }

    override fun postDataset(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, datasetFolderId: String?, addressFolderId: String?): ResponseEntity<JsonNode> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId"))

        val contentType = allHeaders["content-type"]!!

        val options = ImportOptions(
            publish = true,
            parentDocument = if(!datasetFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, datasetFolderId)).id } else null,
            parentAddress = if(!addressFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, addressFolderId)).id } else null,
        )
        ogcRecordService.transactionalImportDocuments(options, collectionId, contentType, data, principal, recordMustExist = false, null)
        return ResponseEntity.ok().build()
    }


    override fun putDataset(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, recordId: String, data: String ): ResponseEntity<JsonNode> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf())

        val contentType = allHeaders["content-type"]!!
//        // check if document exists
//        documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        // import via importer
        val options = ImportOptions( publish = true , overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.transactionalImportDocuments(options, collectionId, contentType, data, principal, recordMustExist = true, recordId)
        return ResponseEntity.ok().build()
    }

    override fun getRecord(allRequestParams: Map<String, String>, collectionId: String, recordId: String, format: String?): ResponseEntity<ByteArray> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf("f"))
        val definedFormat = format ?: defaultFormat
        ogcRecordService.validateParamFormat(definedFormat)

        val record = ogcRecordService.prepareRecord(collectionId, recordId, definedFormat)

        val mimeType = record.second
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record.first)
    }


    override fun getRecords(allRequestParams: Map<String, String>, principal: Authentication, collectionId: String, limit: Int?, offset: Int?, type: List<String>?, bbox: List<Float>?, datetime: String?, q: List<String>?, externalid: List<String>?, format: String?, filter: String? ): ResponseEntity<ByteArray> {
        ogcRecordService.validateCollection(collectionId)
        ogcRecordService.validateRequestParams(allRequestParams, listOf("limit", "offset", "type", "bbox", "datetime", "q", "externalid", "f", "filter"))
        ogcRecordService.validateBbox(bbox)
        val definedFormat = format ?: defaultFormat
        ogcRecordService.validateParamFormat(definedFormat)

        val exporter = exporterFactory.getExporter(DocumentCategory.DATA, format = definedFormat)
        val mimeType: String = exporter.typeInfo.dataType

        // create research query
        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)
        val query = ogcRecordService.buildRecordsQuery(queryLimit, queryOffset, type, bbox, datetime)
        val researchRecords: ResearchResponse = researchService.query(collectionId, query, principal)

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


    override fun handleCSWT(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, datasetFolderId: String?, addressFolderId: String?): ResponseEntity<ByteArray> {
        var statusCode: HttpStatusCode? = null
        var xmlResponse: ByteArray? = null

        try {
            ogcRecordService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId"))
            ogcRecordService.validateCollection(collectionId)
        } catch (e: IgeException) {
            val paramErrorDoc = IngridDocument()
            paramErrorDoc["error"] = ogcCswtService.prepareException(e)
            paramErrorDoc.putBoolean("success", false)
            log.error("Error in CSW transaction", e)
            val paramErrorResult: CSWTransactionResult = ogcCswtService.processCswTransaction(paramErrorDoc)
            xmlResponse = ogcCswtService.prepareXmlResponse(paramErrorResult)
            statusCode = e.statusCode
        }

        if(xmlResponse == null){
            val options = ImportOptions(
                publish = true,
                parentDocument = if(!datasetFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, datasetFolderId)).id } else null,
                parentAddress = if(!addressFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, addressFolderId)).id } else null,
                overwriteAddresses = true,
                overwriteDatasets = true
            )
            val doc: IngridDocument = ogcCswtService.cswTransaction(data, collectionId, principal, options)
            val transactionResult: CSWTransactionResult = ogcCswtService.processCswTransaction(doc)
            xmlResponse = ogcCswtService.prepareXmlResponse(transactionResult)
            statusCode = if(doc["statusCode"] == null) HttpStatus.OK else doc["statusCode"] as HttpStatusCode
        }

        return ResponseEntity.status(statusCode!!).body(xmlResponse)
    }
}