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
package de.ingrid.igeserver.features.ogc_api_records.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.model.MoveRecordsDTO
import de.ingrid.igeserver.features.ogc_api_records.services.JsonSchemaService
import de.ingrid.igeserver.features.ogc_api_records.services.OgcRecordService
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.features.ogc_api_records.services.research_query.OgcApiResearchQueryFactory
import de.ingrid.igeserver.features.ogc_api_records.services.research_query.OgcFilterParameter
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.services.ApiValidationService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ResearchService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.Explode
import io.swagger.v3.oas.annotations.enums.ParameterStyle
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import jakarta.validation.Valid
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.Instant

enum class CollectionFormat(val mimeType: String, val exportType: String) {
    JSON("application/json", "internal"),
    HTML("text/html", "html"),
}

enum class RecordFormat(val mimeType: String, val exportType: String) {
    JSON("application/json", "internal"),
    HTML("text/html", "html"),
    INGRID_ISO("text/xml", "ingridISO"),
    GEOJSON("application/json", "geojson"),
}

enum class SchemaFormat(val mimeType: String, val exportType: String) {
    JSON("application/json", "internal"),
}

enum class DocTypeFormat(val docType: String) {
    InGridSpecialisedTask("InGridSpecialisedTask"),
    InGridGeoDataset("InGridGeoDataset"),
    InGridPublication("InGridPublication"),
    InGridGeoService("InGridGeoService"),
    InGridProject("InGridProject"),
    InGridDataCollection("InGridDataCollection"),
    InGridInformationSystem("InGridInformationSystem"),
    InGridOrganisationDoc("InGridOrganisationDoc"),
    InGridPersonDoc("InGridPersonDoc"),
    UvpApprovalProcedureDoc("UvpApprovalProcedureDoc"),
    UvpForeignProjectDoc("UvpForeignProjectDoc"),
    UvpLineDeterminationDoc("UvpLineDeterminationDoc"),
    UvpNegativePreliminaryAssessmentDoc("UvpNegativePreliminaryAssessmentDoc"),
    UvpSpatialPlanningProcedureDoc("UvpSpatialPlanningProcedureDoc"),
}

enum class DocState(val state: String, val isDraft: Boolean) {
    DRAFT("DRAFT", true),
    PUBLISHED("PUBLISHED", false),
}

@RestController
@RequestMapping(path = ["/api/ogc"])
class OgcApiRecordsController(
    private val ogcRecordService: OgcRecordService,
    private val researchService: ResearchService,
    private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
    private val apiValidationService: ApiValidationService,
    private val documentService: DocumentService,
    private val jsonSchemaService: JsonSchemaService,
    val catalogService: CatalogService,
    private val ogcApiResearchQueryFactory: OgcApiResearchQueryFactory,
) {

    val log = logger()

    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(tags = ["OGC"], responses = [], summary = "Landing Page", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getLandingPage(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        principal: Principal,
        @Parameter(description = "Response format") @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response = ogcRecordService.handleLandingPageRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response)
    }

    @GetMapping(value = ["/conformance"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(tags = ["OGC"], responses = [], summary = "Conformance", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getConformance(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        principal: Principal,
        @Parameter(description = "Response format") @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response = ogcRecordService.handleConformanceRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", response.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response.data)
    }

    @GetMapping(value = ["/collections"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/RecordCollections"], responses = [], summary = "Fetch all collections", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getCatalogs(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        principal: Principal,
        @Parameter(description = "Response format") @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val catalogs = ogcRecordService.prepareCatalogs(principal, format)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalogs)
    }

    @GetMapping(value = ["/collections/{collectionId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/RecordCollections"], responses = [], summary = "Fetch collection by identifier", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getCatalog(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Response format") @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val exporter = ogcCatalogExporterFactory.getExporter(format)
        val catalog = ogcRecordService.prepareCatalog(collectionId, exporter, format)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalog)
    }

    @DeleteMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/Records"], responses = [], summary = "Remove a record from a collection", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun deleteDataset(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        principal: Principal,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Identifier of record within a collection", required = true) @Valid @PathVariable("recordId") recordId: String,
    ): ResponseEntity<Void> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf())
        ogcRecordService.deleteRecord(principal, collectionId, recordId)
        return ResponseEntity.ok().build()
    }

    @PostMapping(value = ["/collections/{collectionId}/items"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/Records"], summary = "Create new record in collection.", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "201", description = "Successful creation of record."),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun postDataset(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Data of record to be stored", required = true) @RequestBody data: String,
        @Parameter(description = "Adds dataset to FOLDER with UUID (custom parameter)") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
        @Parameter(description = "Adds address to FOLDER with UUID (custom parameter)") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
        @Parameter(description = "Describes STATE of data in request body (custom parameter)", style = ParameterStyle.FORM, explode = Explode.FALSE) @RequestParam(value = "state", required = false, defaultValue = "PUBLISHED") state: DocState?,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId", "state"))
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val isDraft = state?.isDraft ?: false

        val options = ImportOptions(
            publish = !isDraft,
            parentDocument = if (!datasetFolderId.isNullOrBlank()) {
                (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, datasetFolderId)).id
            } else {
                null
            },
            parentAddress = if (!addressFolderId.isNullOrBlank()) {
                (documentService.getWrapperByCatalogAndDocumentUuid(collectionId, addressFolderId)).id
            } else {
                null
            },
        )
        val uri = ogcRecordService.transactionalImportDocument(options, collectionId, contentType, data, principal, recordMustExist = false, null, profile)
        return ResponseEntity.created(uri).build()
    }

    @PutMapping(value = ["/collections/{collectionId}/items/{recordId}"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/Records"], summary = "Replace/update an existing record in a collection with a replacement resource with the same resource identifier.", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun putDataset(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Identifier of record within a collection", required = true) @Valid @PathVariable("recordId") recordId: String,
        @Parameter(description = "Data of record to be stored", required = true) @RequestBody data: String,
        @Parameter(description = "Describes STATE of data in request body (custom parameter)", style = ParameterStyle.FORM, explode = Explode.FALSE) @RequestParam(value = "state", required = false, defaultValue = "PUBLISHED") state: DocState?,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("state"))
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val isDraft = state?.isDraft ?: false
        val options = ImportOptions(publish = !isDraft, overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.transactionalImportDocument(
            options,
            collectionId,
            contentType,
            data,
            principal,
            recordMustExist = true,
            recordId,
            profile,
        )
        return ResponseEntity.ok().build()
    }

    @GetMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(
        tags = ["OGC/Records"],
        responses = [],
        summary = "Fetch record by recordId and collectionId",
        hidden = false,
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getRecord(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @Valid @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Identifier of record within a collection", required = true) @Valid @PathVariable("recordId") recordId: String,
        @Parameter(description = "Response format") @RequestParam(value = "f", required = false, defaultValue = "JSON") format: RecordFormat,
        @Parameter(description = "Response state (custom parameter)", style = ParameterStyle.FORM, explode = Explode.FALSE) @RequestParam(value = "state", required = false, defaultValue = "PUBLISHED") state: DocState?,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("f", "state"))

        val useDraft = state?.isDraft ?: false

        val record = ogcRecordService.prepareRecord(collectionId, recordId, format, useDraft)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record)
    }

    @GetMapping(value = ["/collections/{collectionId}/items"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(
        tags = ["OGC/Records"],
        responses = [],
        summary = "Fetch records of collection",
        hidden = false,
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getRecords(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @Valid @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Paging limit of requested records") @RequestParam(value = "limit", required = false) limit: Int?,
        @Parameter(description = "Paging offset of requested records") @RequestParam(value = "offset", required = false) offset: Int?,
        @Parameter(description = "Comma-separated list of record types", explode = Explode.FALSE, style = ParameterStyle.MATRIX) @RequestParam(value = "type", required = false) type: List<String>?,
        @Parameter(
            description = "Bounding box - array of 4 numbers in order:" +
                "\n\n1. Lower left Corner (Longitude)" +
                "\n\n2. Lower Left Corner (Latitude)" +
                "\n\n3. Upper Right Corner (Longitude)" +
                "\n\n4. Upper Right Corner (Latitude)",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @ArraySchema(minItems = 4, maxItems = 4) @RequestParam(value = "bbox", required = false) bbox: List<Float>?,
        @Parameter(
            description = "Time instance or time period (RFC 3339). If the temporal extent of the record intersects the specified data-time value then the record shall be presented in the response document." +
                "\n\nExamples:  " +
                "\n\n• A closed interval: \"2023-08-02T00:00:00Z/2023-08-05T23:59:59Z\" " +
                "\n\n• Open intervals (all records from): \"2023-08-2T00:00:00Z/..\" " +
                "\n\n• Open intervals (all records until): \"../2023-08-05T23:59:59Z\" " +
                "\n\n### To Do:" +
                "\n\n• currently time span refers to timeDate of last published version (key = '_modified')" +
                "\n\n• check time intersections",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
            schema = Schema(pattern = "^(([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z])/([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z]))$"),
            // to exclude "../.." queries, add this expression at start of pattern expression: (?!([.][.]/[.][.]))
            // add milli seconds \.(\d{3})
        ) @RequestParam(value = "datetime", required = false) @Valid datetime: String?,
        @Parameter(description = "Performs a case-insensitive keyword search across following record fields: 'title' and 'description'. Use a comma-separated list of terms. Spaces have no special meaning.", explode = Explode.FALSE, style = ParameterStyle.MATRIX) @RequestParam(value = "q", required = false) @Valid qParameter: List<String>?,
        @Parameter(
            description = "Search by external identifiers" +
                "\n\n### ! Not yet implemented !" +
                "\n\nAn equality predicate consistent of a comma-separated list of external resource identifiers. Only records with the specified external identifiers shall appear in the response set.",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @RequestParam(value = "externalIds", required = false) @Valid externalIds: List<String>?,
        // PARAMETER : f
        @Parameter(
            description = "Response format:" +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format." +
                "\n\n• get response in XML, ISO 19139 with value `INGRID_ISO`" +
                "\n\n• get response in GEOJSON with value `GEOJSON`" +
                "\n\n• get response in HTML with value `HTML`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: RecordFormat,
        // PARAMETER : filter
        @Parameter(
            description = "Filter" +
                "\n\n### ! Not yet implemented !" +
                "\n\nSHALL support the filter parameter as defined in Parameter `filter`." +
                "\n\nSHALL support the filter-lang parameter as defined in Parameter `filter-lang`." +
                "\n\nSHALL support the filter-crs parameter as defined in Parameter `filter-crs`." +
                "\n\n[Source](https://docs.ogc.org/is/20-004r1/20-004r1.html#_da692373-54f2-13c1-2d81-f16cf3fe8c94)" +
                "\n\n[Additional Source](https://portal.ogc.org/files/96288#filter-param)",
        ) @RequestParam(value = "filter", required = false) filter: String?,
        @Parameter(description = "Get records by its state (custom parameter)", style = ParameterStyle.FORM, explode = Explode.FALSE) @RequestParam(value = "state", required = false, defaultValue = "PUBLISHED") state: DocState?,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("limit", "offset", "type", "bbox", "datetime", "q", "externalIds", "f", "filter", "state"))
        apiValidationService.validateBbox(bbox)

        if (externalIds != null) throw ServerException.withReason("Query parameter 'externalIds' is not yet implemented but reserved for future use.")
        if (filter != null) throw ServerException.withReason("Query parameter 'filter' is not yet implemented but reserved for future use.")

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
            numberReturned = if (totalHits < queryLimit) totalHits else queryLimit,
            numberMatched = totalHits,
            Instant.now(),
        )
        val useDraft = state?.isDraft ?: false

        // query all record details in right response format via exporter
        val records: ByteArray = ogcRecordService.prepareRecords(researchRecords, collectionId, format, links, queryMetadata, useDraft)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(records)
    }

    @PostMapping(value = ["/collections/{collectionId}/items/actions/move"], consumes = [MediaType.APPLICATION_JSON_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(
        tags = ["OGC/Records/Actions"],
        hidden = false,
        summary = "Move records to a specified folder or top level",
        description = "This endpoint allows moving records identified by `recordId` to a folder identified by `folderId`. If `folderId` is omitted, null, or an empty string, the document will be moved to the top level.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation."),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun actionMoveRecords(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Json array containing recordId and folderId as destination", required = true) @RequestBody data: List<MoveRecordsDTO>,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        ogcRecordService.moveRecords(collectionId, data)
        return ResponseEntity.ok().build()
    }

    @GetMapping(value = ["/collections/{collectionId}/schema"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(
        tags = ["OGC/Schema"],
        hidden = false,
        summary = "Fetch json schema of record type in collection",
        description = "In the context of InGrid, a collection can include multiple types of records. Therefore, the request parameter `type` is mandatory.",
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation."),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun recordSchema(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "Identifier of collection (catalog identifier)", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "Record type (custom parameter)") @RequestParam(value = "type", required = true) type: DocTypeFormat,
        @Parameter(description = "Get JSON schema for different states of record (custom parameter)", style = ParameterStyle.FORM, explode = Explode.FALSE) @RequestParam(value = "state", required = false, defaultValue = "PUBLISHED") state: DocState?,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("type", "state"))

        // TODO Throw exception if requested docType is not supported by catalog. Include list of supported docTypes in exception.

        val jsonSchema = jsonSchemaService.getSchemaOfDocType(collectionId, type.docType, state?.isDraft ?: false)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", "application/json")
        return ResponseEntity.ok().headers(responseHeaders).body(jsonSchema)
    }
}
