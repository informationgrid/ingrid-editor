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
package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.model.Link
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.ogc.OgcFilterParameter
import de.ingrid.igeserver.ogc.OgcApiResearchQueryFactory
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.http.HttpHeaders
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.Instant

@RestController
@Profile("ogc-api")
@RequestMapping(path = ["/api/ogc"])
class OgcApiRecordsController(
        private val ogcRecordService: OgcRecordService,
        private val researchService: ResearchService,
        private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
        private val exporterFactory: ExporterFactory,
        private val apiValidationService: ApiValidationService,
        private val documentService: DocumentService,
        val catalogService: CatalogService,
        private val ogcApiResearchQueryFactory: OgcApiResearchQueryFactory
        ) : OgcApiRecords {

    val log = logger()


    override fun getLandingPage(allRequestParams: Map<String, String>, principal: Principal, format: CollectionFormat): ResponseEntity<ByteArray>{
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response: ResponsePackage = ogcRecordService.handleLandingPageRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", response.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response.data)
    }

    override fun getConformance(allRequestParams: Map<String, String>, principal: Principal, format: CollectionFormat): ResponseEntity<ByteArray>{
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response = ogcRecordService.handleConformanceRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", response.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response.data)
    }

    override fun getCatalogs(allRequestParams: Map<String, String>, principal: Principal, format: CollectionFormat): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val exporter = ogcCatalogExporterFactory.getExporter(format)
        val catalogs = ogcRecordService.prepareCatalogs(principal, format)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalogs)
    }

    override fun getCatalog(allRequestParams: Map<String, String>, collectionId: String, format: CollectionFormat): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val exporter = ogcCatalogExporterFactory.getExporter(format)
        val catalog = ogcRecordService.prepareCatalog(collectionId, exporter, format)

        val mimeType = exporter.typeInfo.dataType
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalog)
    }


    override fun deleteDataset(allRequestParams: Map<String, String>, principal: Principal, collectionId: String, recordId: String): ResponseEntity<Void> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf())
        ogcRecordService.deleteRecord(principal, collectionId, recordId)
        return ResponseEntity.ok().build()
    }

    override fun postDataset(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, data: String, datasetFolderId: String?, addressFolderId: String?): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId"))
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val options = ImportOptions(
            publish = true,
            parentDocument = if(!datasetFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, datasetFolderId)).id } else null,
            parentAddress = if(!addressFolderId.isNullOrBlank()) { (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, addressFolderId)).id } else null,
        )
        ogcRecordService.transactionalImportDocuments(options, collectionId, contentType, data, principal, recordMustExist = false, null, profile)
        return ResponseEntity.ok().build()
    }


    override fun putDataset(allRequestParams: Map<String, String>, allHeaders: Map<String, String>, principal: Authentication, collectionId: String, recordId: String, data: String): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf())
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val options = ImportOptions( publish = true , overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.transactionalImportDocuments(
            options,
            collectionId,
            contentType,
            data,
            principal,
            recordMustExist = true,
            recordId,
            profile
        )
        return ResponseEntity.ok().build()
    }

    override fun getRecord(allRequestParams: Map<String, String>, collectionId: String, recordId: String, format: RecordFormat): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val record = ogcRecordService.prepareRecord(collectionId, recordId, format)
        val mimeType = record.second
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record.first)
    }


    override fun getRecords(allRequestParams: Map<String, String>, principal: Authentication, collectionId: String, limit: Int?, offset: Int?, type: List<String>?, bbox: List<Float>?, datetime: String?, qParameter: List<String>?, externalid: List<String>?, format: RecordFormat, filter: String? ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("limit", "offset", "type", "bbox", "datetime", "q", "externalid", "f", "filter"))
        apiValidationService.validateBbox(bbox)

        val exportFormat = if(format == RecordFormat.json) "internal" else format.toString()
        val exporter = exporterFactory.getExporter(DocumentCategory.DATA, format = exportFormat)
        val mimeType: String = exporter.typeInfo.dataType

        val profile = catalogService.getProfileFromCatalog(collectionId)

        // create research query
        val (queryLimit, queryOffset) = ogcRecordService.pageLimitAndOffset(offset, limit)

        val ogcParameter = OgcFilterParameter(queryLimit, queryOffset, type, bbox, datetime, qParameter)

        val ogcApiResearchQuery = ogcApiResearchQueryFactory.getQuery(profile, ogcParameter)

        val researchRecords: ResearchResponse = researchService.query(collectionId, ogcApiResearchQuery, principal)

        // links: next previous self
        val totalHits = researchRecords.totalHits
        val links: List<Link> = ogcRecordService.getLinksForRecords(offset, limit, totalHits, collectionId, format)
        val queryMetadata = QueryMetadata(
                numberReturned = if(totalHits < queryLimit) totalHits else queryLimit,
                numberMatched = totalHits,
                Instant.now()
        )
        // query all record details in right response format via exporter
        val records: ByteArray = ogcRecordService.prepareRecords(researchRecords, collectionId, format, mimeType, links, queryMetadata)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(records)
    }



}
