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
package de.ingrid.igeserver.api

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.exports.catalog.CatalogExportService
import de.ingrid.igeserver.exports.catalog.CatalogTransferService.ExportedCatalog
import de.ingrid.igeserver.imports.CatalogImportOptions
import de.ingrid.igeserver.imports.CatalogImportService
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.CatalogConfigRequest
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.utils.FileUploadHandler
import de.ingrid.igeserver.utils.ifFalse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpHeaders.CONTENT_DISPOSITION
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.security.Principal
import java.text.SimpleDateFormat
import java.util.*

@RestController
@RequestMapping("/api")
class CatalogApiController(
    val catalogService: CatalogService,
    val documentService: DocumentService,
    val researchService: ResearchService,
    val catalogImportService: CatalogImportService,
    val catalogExportService: CatalogExportService,
    val authUtils: AuthUtils,
    val fileUploadHandler: FileUploadHandler,
) : CatalogApi {
    val log = logger()

    override fun catalogs(principal: Principal): ResponseEntity<List<Catalog>> {
        val catalogs = catalogService.getCatalogsForPrincipal(principal)

        return ResponseEntity.ok().body(catalogs.toList())
    }

    override fun catalogStatistic(identifier: String): ResponseEntity<CatalogStatistic> {
        val statistic = getStatisticData(identifier)
        return ResponseEntity.ok().body(statistic)
    }

    override fun getCatalogConfig(principal: Principal): ResponseEntity<CatalogConfigRequest> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val catalog = catalogService.getCatalogById(catalogId)
        val config = catalog.settings.config

        val response = CatalogConfigRequest(catalog.name, catalog.description, config)
        return ResponseEntity.ok(response)
    }

    override fun saveCatalogConfig(
        principal: Principal,
        @RequestBody data: CatalogConfigRequest,
    ): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        catalogService.updateCatalogConfig(catalogId, data.name, data.description, data.config)
        return ResponseEntity.ok().build()
    }

    private fun getStatisticData(catalogIdentifier: String): CatalogStatistic {
        val filter = BoolFilter("AND", listOf("document_wrapper.type != 'FOLDER'", "deleted = 0"), null, null, false)
        val response = researchService.query(
            catalogIdentifier,
            ResearchQuery(
                null,
                filter,
                orderByField = "modified",
                orderByDirection = "DESC",
                pagination = ResearchPaging(1, 1),
            ),
        )

        return if (response.totalHits > 0) {
            val hit = response.hits[0]
            CatalogStatistic(
                hit.contentModified,
                response.totalHits,
            )
        } else {
            CatalogStatistic()
        }
    }

    @AuditLog(category = "catalogs", action = "create_catalog")
    override fun createCatalog(settings: Catalog): ResponseEntity<Catalog> {
        if (catalogService.catalogWithNameExists(settings.name)) throw ConflictException.withReason("Catalog '${settings.name}' already exists")
        val catalog = catalogService.createCatalog(settings)

        catalogService.initializeCatalog(catalog.identifier, settings.type)

        return ResponseEntity.ok().body(catalog)
    }

    @AuditLog(category = "catalogs", action = "update_catalog")
    override fun updateCatalog(name: String, settings: Catalog): ResponseEntity<Void> {
        catalogService.updateCatalog(settings)
        return ResponseEntity.ok().build()
    }

    @AuditLog(category = "catalogs", action = "delete_catalog")
    override fun deleteCatalog(name: String): ResponseEntity<Void> {
        catalogService.removeCatalog(name)
        return ResponseEntity.ok().build()
    }

    override fun catalogImport(
        principal: Principal,
        file: MultipartFile,
        flowChunkNumber: Int,
        flowTotalChunks: Int,
        flowCurrentChunkSize: Long,
        flowTotalSize: Long,
        flowIdentifier: String,
        flowFilename: String,
        allowUpdate: Boolean,
    ): ResponseEntity<Unit> {
        authUtils.isSuperAdmin(principal).ifFalse {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val combinedFile = fileUploadHandler.handleChunk(
            file = file,
            flowChunkNumber = flowChunkNumber,
            flowTotalChunks = flowTotalChunks,
            flowIdentifier = flowIdentifier,
            flowFilename = flowFilename,
        )

        combinedFile?.let {
            // Actual Import
            val exportedCatalog: ExportedCatalog = jacksonObjectMapper()
                .enable(JsonParser.Feature.INCLUDE_SOURCE_IN_LOCATION)
                .readValue(it.toFile())
            catalogImportService.importCatalog(exportedCatalog, CatalogImportOptions(allowUpdate))

            fileUploadHandler.cleanup(flowIdentifier)
            return ResponseEntity.ok().build()
        }

        // Not every chunk uploaded yet
        return ResponseEntity.status(HttpStatus.ACCEPTED).build()
    }

    override fun catalogExport(principal: Principal, catalogIdentifier: String): ResponseEntity<ByteArray?> {
        authUtils.isSuperAdmin(principal).ifFalse {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .build()
        }

        val exportedTables = catalogExportService.exportCatalog(catalogIdentifier)
        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())
        mapper.dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
        val file = mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(exportedTables)
        return ResponseEntity.ok()
            .header(CONTENT_DISPOSITION, "attachment;filename=catalogExport.json")
            .contentType(MediaType.APPLICATION_JSON)
            .body(file)
    }
}

data class CatalogStatistic(
    val lastDocModification: Date? = null,
    val countDocuments: Int = 0,
)
