/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.features.ogc_api_records.api.CollectionFormat
import de.ingrid.igeserver.features.ogc_api_records.api.RecordFormat
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.OgcCatalogExporter
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.model.MoveRecordsDTO
import de.ingrid.igeserver.features.ogc_api_records.services.formatFactory.FormatFactory
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportResult
import de.ingrid.igeserver.services.ExportService
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URI
import java.security.Principal
import java.time.Instant

data class LandingPageInfo(
    val title: String,
    val description: String,
    val links: List<Link>,
)

data class Conformance(
    val conformsTo: List<String>,
)

data class ResponsePackage(
    val data: ByteArray,
    val mimeType: String,
)

data class QueryMetadata(
    var numberReturned: Int,
    var numberMatched: Int,
    var timeStamp: Instant?,
)

@Service
class OgcRecordService(
    private val catalogService: CatalogService,
    private val exportService: ExportService,
    private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
    private val documentService: DocumentService,
    private val importService: ImportService,
    private val formatFactory: FormatFactory,
    generalProperties: GeneralProperties,
) {
    val hostUrl = generalProperties.host
    val hostnameOgcApi = generalProperties.host + "/api/ogc"

    fun handleLandingPageRequest(requestedFormat: CollectionFormat): ByteArray {
        val linkList: MutableList<Link> = mutableListOf()

        linkList.add(Link(href = hostnameOgcApi, rel = "self", type = requestedFormat.mimeType, title = "This document"))
        CollectionFormat.entries
            .filter { it != requestedFormat }
            .forEach {
                linkList.add(
                    Link(href = "$hostnameOgcApi?f=$it", rel = "alternate", type = it.mimeType, title = "Link to the landing page in format '$it'"),
                )
            }
        linkList.add(Link(href = "$hostUrl/v3/api-docs", rel = "service-doc", type = "application/json", title = "The API documentation"))
        linkList.add(Link(href = "$hostnameOgcApi/conformance", rel = "conformance", type = "application/json", title = "OGC API conformance classes implemented by this server"))
        linkList.add(Link(href = "$hostnameOgcApi/collections", rel = "collections", type = "application/json", title = "Information about the record collections"))

        val info = LandingPageInfo(
            title = "InGrid Editor - OGC API Records",
            description = "Access to data of InGrid Editor via a Web API that conforms to the OGC API Records specification.",
            links = linkList,
        )

        val bodyFormatter = formatFactory.getFormatter(requestedFormat.mimeType)
        val responseByteArray = bodyFormatter.basic(info, "Landing page")

        return responseByteArray
    }

    fun handleConformanceRequest(requestedFormat: CollectionFormat): ResponsePackage {
        val mimeType = requestedFormat.mimeType

        val conformance = Conformance(
            conformsTo = listOf(
                "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/core",
                "http://www.opengis.net/spec/ogcapi-features-1/1.0/conf/html",
            ),
        )

        val bodyFormatter = formatFactory.getFormatter(requestedFormat.mimeType)
        val responseByteArray = bodyFormatter.basic(conformance, "Landing page")

        return ResponsePackage(
            data = responseByteArray,
            mimeType = mimeType,
        )
    }

    @Transactional
    fun transactionalImportDocument(
        collectionId: String,
        recordId: String?,
        options: ImportOptions,
        contentType: String,
        data: String,
        principal: Authentication,
        recordMustExist: Boolean,
        profile: CatalogProfile,
    ): URI = importDocument(collectionId, recordId, options, contentType, data, principal, recordMustExist, profile)

    fun importDocument(collectionId: String, recordId: String?, options: ImportOptions, contentType: String, data: String, principal: Authentication, recordMustExist: Boolean, profile: CatalogProfile): URI {
        val bodyFormatter = formatFactory.getFormatter(contentType)
        val formattedData = bodyFormatter.formatBeforeImport(collectionId, data, options.publish)

        val optimizedImportAnalysis = importService.prepareImportAnalysis(profile, collectionId, contentType, formattedData)

        if (optimizedImportAnalysis.existingDatasets.isEmpty()) {
            if (recordMustExist) throw NotFoundException.withMissingResource(recordId!!, "Record")
        } else {
            if (!recordMustExist) throw ClientException.withReason("Import Failed: Record with ID '$recordId' already exists.")
            val id = optimizedImportAnalysis.existingDatasets[0].uuid
            if (recordId != id) throw ClientException.withReason("Update Failed: Target ID '$recordId' does not match dataset ID '$id'.")
        }
        importService.importAnalyzedDatasets(
            principal = principal,
            catalogId = collectionId,
            analysis = optimizedImportAnalysis,
            options = options,
            message = Message(),
        )

        return generateUriOfCreatedRecord(collectionId, optimizedImportAnalysis.references[0].document.uuid)
    }

    fun generateUriOfCreatedRecord(collectionId: String, recordId: String): URI = URI("/collections/$collectionId/items/$recordId")

    fun getLinksForRecords(offset: Int, limit: Int, totalHits: Int, collectionId: String, requestedFormat: RecordFormat): List<Link> {
        val list: MutableList<Link> = mutableListOf()

        // prepare pageing numbers & string fragments
        val nextOffset: Int = offset + limit
        val prevOffset: Int = if (offset < limit) 0 else offset - limit
        val baseUrl = "$hostnameOgcApi/collections/$collectionId"
        val recordBaseUrl = "$baseUrl/items?f="
        val limitString = "&limit=$limit"
        val selfOffsetString = "&offset=$offset"
        val prevOffsetString = "&offset=$prevOffset"
        val nextOffsetString = "&offset=$nextOffset"

        // add self Link to list
        RecordFormat.entries
            .filter { it == requestedFormat }
            .forEach {
                list.add(
                    Link(
                        recordBaseUrl + requestedFormat + limitString + selfOffsetString,
                        "self",
                        it.mimeType,
                        "Link to this response",
                    ),
                )
            }

        // add collection links in supported formats
        CollectionFormat.entries.forEach {
            val supportedFormat = it
            list.add(
                Link(
                    "$baseUrl?f=$supportedFormat",
                    "collection",
                    it.mimeType,
                    "Link to the containing collection in format '$supportedFormat' ",
                ),
            )
        }

        // add alternate, next, previous links for each format
        RecordFormat.entries.forEach {
            val supportedFormat = it
            val mimeType = it.mimeType
            if (supportedFormat != requestedFormat) {
                list.add(
                    Link(
                        recordBaseUrl + supportedFormat + limitString + selfOffsetString,
                        "alternate",
                        mimeType,
                        "Link to this response in format '$supportedFormat' ",
                    ),
                )
            }
            if (totalHits > nextOffset) {
                list.add(
                    Link(
                        recordBaseUrl + supportedFormat + limitString + nextOffsetString,
                        "next",
                        mimeType,
                        "Link to the next set of records in format '$supportedFormat' ",
                    ),
                )
            }
            if (offset > 0) {
                list.add(
                    Link(
                        recordBaseUrl + supportedFormat + limitString + prevOffsetString,
                        "prev",
                        mimeType,
                        "Link to the previous set of records in format '$supportedFormat' ",
                    ),
                )
            }
        }

        return list
    }

    fun prepareCatalog(collectionId: String, exporter: OgcCatalogExporter, format: CollectionFormat): ByteArray {
        val catalog = exportCatalog(collectionId, exporter)
        val bodyFormatter = formatFactory.getFormatter(format.mimeType)
        return bodyFormatter.collections(listOf(catalog), true, null, null)
    }

    fun prepareCatalogs(principal: Principal, format: CollectionFormat): ByteArray {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)
        val exporter = ogcCatalogExporterFactory.getExporter(format)
        val catalogList: MutableList<Any> = mutableListOf()
        for (catalog in catalogs) catalogList.add(exportCatalog(catalog.identifier, exporter))
        val bodyFormatter = formatFactory.getFormatter(format.mimeType)
        return bodyFormatter.collections(catalogList, false, null, null)
    }

    private fun exportCatalog(collectionId: String, exporter: OgcCatalogExporter): Any {
        try {
            val catalogData: Catalog = catalogService.getCatalogById(collectionId)
            return exporter.run(catalogData)
        } catch (e: Exception) {
            throw NotFoundException.withMissingResource(collectionId, "collection")
        }
    }

    fun deleteRecord(principal: Principal, collectionId: String, recordId: String) {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        wrapper.id?.let { documentService.deleteDocument(principal, collectionId, it) }
    }

    fun prepareRecord(collectionId: String, recordId: String, format: RecordFormat, useDraft: Boolean): ByteArray {
        val record = exportRecord(recordId, collectionId, format, useDraft)
        val bodyFormatter = formatFactory.getFormatter(format.mimeType)
        val formatedRecord = bodyFormatter.records(listOf(record), useDraft, true, null, null)
        return formatedRecord
    }

    fun prepareRecords(records: ResearchResponse, collectionId: String, format: RecordFormat, links: List<Link>, queryMetadata: QueryMetadata, useDraft: Boolean): ByteArray {
        val records: List<ExportResult> = records.hits.map { record -> exportRecord(record.uuid!!, collectionId, format, useDraft) }
        val bodyFormatter = formatFactory.getFormatter(format.mimeType)
        val formatedRecords = bodyFormatter.records(records, useDraft, false, links, queryMetadata)
        return formatedRecords
    }

    private fun exportRecord(recordId: String, collectionId: String, format: RecordFormat, useDraft: Boolean): ExportResult {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
        val id = wrapper.id!!
        val options = ExportRequestParameter(
            ids = listOf(id),
            exportFormat = format.exportType,
            useDraft = useDraft,
        )
        return try {
            exportService.export(collectionId, options)
        } catch (exportError: ServerException) {
            if (!useDraft) {
                throw ServerException.withReason("No record with state 'PUBLISHED' found for recordId: $recordId")
            } else {
                throw exportError
            }
        }
    }

    @Transactional
    fun moveRecords(collectionId: String, data: List<MoveRecordsDTO>) {
        for (moveAction in data) {
            if (moveAction.recordId.isBlank()) throw ClientException.withReason("Failed to move records to folder: Missing recordId.")
            val recordId = moveAction.recordId
            val folderId = moveAction.folderId
            val recordWrapper = documentService.getWrapperByCatalogAndDocumentUuid(collectionId, recordId)
            val folderWrapper = if (folderId == "" || folderId == null) null else documentService.getWrapperByCatalogAndDocumentUuid(collectionId, folderId)
            val folderWrapperId = if (folderWrapper == null) {
                null
            } else if (folderWrapper.type != "FOLDER") {
                throw ClientException.withReason("Failed to move records to folder: folderId '$folderId' is of type '${folderWrapper.type}'. The folderId must represent a FOLDER.")
            } else if (folderWrapper.category != recordWrapper.category) {
                throw ClientException.withReason("Failed to move records to folder: folderId '$folderId' has category '${folderWrapper.category}' and recordId '$recordId' has category '${recordWrapper.category}'.")
            } else {
                folderWrapper.id
            }
            documentService.updateParent(collectionId, recordWrapper.id!!, folderWrapperId)
        }
    }
}
