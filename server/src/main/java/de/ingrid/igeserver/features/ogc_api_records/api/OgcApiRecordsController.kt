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
package de.ingrid.igeserver.features.ogc_api_records.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.features.ogc_api_records.export_catalog.OgcCatalogExporterFactory
import de.ingrid.igeserver.features.ogc_api_records.model.Link
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
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.Converter
import org.springframework.format.FormatterRegistry
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Component
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
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import java.security.Principal
import java.time.Instant

@Component
class RecordFormatCapitalizeConverter : Converter<String, RecordFormat> {
    override fun convert(source: String): RecordFormat? = try {
        RecordFormat.valueOf(source.uppercase())
    } catch (err: IllegalArgumentException) {
        // Todo -> Fix error feedback. The following ClinetException is not return. Instead it returns 'err' from catch .
        throw ClientException.withReason("Value '$String' for request parameter 'f' not supported")
    }
}

@Component
class CollectionFormatCapitalizeConverter : Converter<String, CollectionFormat> {
    override fun convert(source: String): CollectionFormat? = try {
        CollectionFormat.valueOf(source.uppercase())
    } catch (err: IllegalArgumentException) {
        // Todo -> Fix error feedback. The following ClinetException is not return. Instead it returns 'err' from catch .
        throw ClientException.withReason("Value '$String' for request parameter 'f' not supported")
    }
}

@Configuration
class WebConfig : WebMvcConfigurer {
    override fun addFormatters(registry: FormatterRegistry) {
        registry.addConverter(RecordFormatCapitalizeConverter())
        registry.addConverter(CollectionFormatCapitalizeConverter())
    }
}

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

@RestController
@RequestMapping(path = ["/api/ogc"])
class OgcApiRecordsController(
    private val ogcRecordService: OgcRecordService,
    private val researchService: ResearchService,
    private val ogcCatalogExporterFactory: OgcCatalogExporterFactory,
    private val exporterFactory: ExporterFactory,
    private val apiValidationService: ApiValidationService,
    private val documentService: DocumentService,
    val catalogService: CatalogService,
    private val ogcApiResearchQueryFactory: OgcApiResearchQueryFactory,
) {

    val log = logger()

    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(tags = ["OGC"], responses = [], summary = "Get Landing Page", hidden = false)
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
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response = ogcRecordService.handleLandingPageRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response)
    }

    @GetMapping(value = ["/conformance"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE])
    @Operation(tags = ["OGC"], responses = [], summary = "Get Conformance", hidden = false)
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
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val response = ogcRecordService.handleConformanceRequest(format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", response.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(response.data)
    }

    @GetMapping(value = ["/collections"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/RecordCollections"], responses = [], summary = "Get all catalogs", hidden = false)
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
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val catalogs = ogcRecordService.prepareCatalogs(principal, format)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(catalogs)
    }

    @GetMapping(value = ["/collections/{collectionId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/RecordCollections"], responses = [], summary = "Get catalog by catalog-ID", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation"),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun getCatalog(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: CollectionFormat,
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
    @Operation(tags = ["OGC/Records"], responses = [], summary = "Remove a record from a catalog", hidden = false)
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
        @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
    ): ResponseEntity<Void> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf())
        ogcRecordService.deleteRecord(principal, collectionId, recordId)
        return ResponseEntity.ok().build()
    }

    @PostMapping(value = ["/collections/{collectionId}/items"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/Records"], summary = "Add/import record(s) to a collection.", hidden = false)
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "Successful operation."),
            ApiResponse(responseCode = "400", description = "Invalid input"),
            ApiResponse(responseCode = "404", description = "Not found"),
        ],
    )
    fun postDataset(
        @Parameter(hidden = true) @RequestParam allRequestParams: Map<String, String>,
        @RequestHeader allHeaders: Map<String, String>,
        principal: Authentication,
        @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: String,
        @Parameter(description = "## Dataset Folder ID \n **Custom Parameter** \n\n Add Dataset to Folder with UUID") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
        @Parameter(description = "## Address Folder ID \n **Custom Parameter** \n\n Add Address to Folder with UUID") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("datasetFolderId", "addressFolderId"))
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val options = ImportOptions(
            publish = true,
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
        ogcRecordService.transactionalImportDocuments(options, collectionId, contentType, data, principal, recordMustExist = false, null, profile)
        return ResponseEntity.ok().build()
    }

    @PutMapping(value = ["/collections/{collectionId}/items/{recordId}"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(tags = ["OGC/Records"], summary = "Replace/update an existing resource in a collection with a replacement resource with the same resource identifier.", hidden = false)
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
        @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
        @Parameter(description = "The data to be stored.", required = true) @RequestBody data: String,
    ): ResponseEntity<JsonNode> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf())
        val profile = catalogService.getProfileFromCatalog(collectionId)

        val contentType = allHeaders["content-type"]!!

        val options = ImportOptions(publish = true, overwriteAddresses = true, overwriteDatasets = true)
        ogcRecordService.transactionalImportDocuments(
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
        summary = "Get record by record-ID and catalog-ID",
        hidden = false,
        description = "# Fetch a Record" +
            "" +
            "\n\n### A 200-response SHALL include the following links in the response:\n" +
            "\n\na link to the response document (relation: self),\n" +
            "\n\na link to the response document in every other media type supported by the service (relation: alternate), and\n" +
            "\n\na link to the feature collection that contains this feature (relation: collection)." +
            "\n\nAll links in that response where rel is self, alternate, or collection SHALL include the type link parameter." +
            "\n\n[Source: OGC API - Features - Part 1: Core](https://docs.ogc.org/DRAFTS/17-069r5.html#_response_6)" +
            "\n\n## Currently working on profile: **Ingrid**",
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
        @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @Valid @PathVariable("collectionId") collectionId: String,
        @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`" +
                "\n\n• get response in XML, ISO 19139 with value `INGRID_ISO` \n\n• get response in GEOJSON with value `GEOJSON`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: RecordFormat,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("f"))

        val record = ogcRecordService.prepareRecord(collectionId, recordId, format)
        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)
        return ResponseEntity.ok().headers(responseHeaders).body(record)
    }

    @GetMapping(value = ["/collections/{collectionId}/items"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(
        tags = ["OGC/Records"],
        responses = [],
        summary = "Query records of a catalog",
        hidden = false,
        description = "# Fetch Records\n\nFetch records of the catalog with id `collectionId`." +
            "As specified in the [Records Access](https://docs.ogc.org/DRAFTS/20-004.html#records-access) clause, records are accessed using the HTTP GET method via the /collections/{collectionId}/items path." +
            "\n\n\n\n## Currently working on profile: **Ingrid**",
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
        // PARAMETER : collectionId
        @Parameter(
            description = "## Collection ID \n **OGC Parameter**" +
                "\n\n The identifier for a specific record collection (i.e. catalogue identifier).",
            required = true,
        ) @Valid @PathVariable("collectionId") collectionId: String,
        // PARAMETER : limit
        @Parameter(
            description = "## Paging: Limit of requested Records \n **OGC Parameter SHOULD**" +
                "\n\nThe number of records to be presented in a response document." +
                "\n\n• defaultLimit = 10" +
                "\n\n• maxLimit = Int.MAX_VALUE" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#local-resources-catalogue-limit-param)",
        ) @RequestParam(value = "limit", required = false) limit: Int?,
        // PARAMETER : offset
        @Parameter(
            description = "## Paging: Offset of requested Records\n **OGC Parameter SHOULD**" +
                "\n\n**Reference from Feature Collection:** If the request is to return building features and \"10\" is the default `limit`, the links in the response could be (in this example represented as link headers and using an additional parameter `offset` to implement next links - and the optional prev links)" +
                "\n\n[Source: OGC API - Features - Part 1: Core](https://docs.ogc.org/is/17-069r3/17-069r3.html#_response_6)",
        ) @RequestParam(value = "offset", required = false) offset: Int?,
        // PARAMETER : type
        @Parameter(
            description = "## Document Type\n **OGC Parameter SHOULD**" +
                "\n\nAn equality predicate consistent of a comma-separated list of resource types. Only records of the listed type shall appear in the resource set." +
                "\n\nOnly records whose type, as indicated by the value of the `type` core queryable, is equal to one of the listed values specified using the `type` parameter SHALL be in the result set." +
                "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-type)" +
                "\n\n### To do:" +
                "\n\n• The definition of the `type` parameter SHOULD be extended to enumerate the list of known record types." +
                "\n\n### List of record types" +
                "\n\nInGridSpecialisedTask, InGridGeoDataset, InGridPublication, InGridGeoService, InGridProject, InGridDataCollection, InGridInformationSystem, InGridOrganisationDoc, InGridPersonDoc",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @RequestParam(value = "type", required = false) type: List<String>?,
        // PARAMETER : bbox
        @Parameter(
            description = "## Bounding Box\n **OGC ParameterSHOULD**" +
                "\n\nA bounding box. If the spatial extent of the record intersects the specified bounding box then the record shall be presented in the response document." +
                "\n\nThe `bbox` array requires 4 numbers in order:" +
                "\n\n1. Lower left Corner, Longitude" +
                "\n\n2. Lower Left Corner, Latitude" +
                "\n\n3. Upper Right Corner, Longitude" +
                "\n\n4. Upper Right Corner, Latitude" +
                "\n\n[Source: OGC API - Features - Part 1: Core corrigendum](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_bbox)",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @ArraySchema(minItems = 4, maxItems = 4) @RequestParam(value = "bbox", required = false) bbox: List<Float>?,
        // PARAMETER : datetime
        @Parameter(
            description = "## Time span\n **OGC Parameter SHOULD**" +
                "\n\nA time instance or time period. If the temporal extent of the record intersects the specified data/time value then the record shall be presented in the response document. " +
                "Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots.  " +
                "\n\nOnly records that have a temporal property that intersects the value of `datetime` are selected. " +
                "\n\nExamples:  " +
                "\n\n• A closed interval: \"2023-08-02T00:00:00Z/2023-08-05T23:59:59Z\" " +
                "\n\n• Open intervals (all records from): \"2023-08-2T00:00:00Z/..\" " +
                "\n\n• Open intervals (all records until): \"../2023-08-05T23:59:59Z\" " +
                "\n\n[Source: OGC API - Features - Part 1: Core corrigendum](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_datetime)" +
                "\n\n### To Do:" +
                "\n\n• currently time span refers to timeDate of last published version (key = '_modified')" +
                "\n\n• check time intersections",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
            schema = Schema(pattern = "^(([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z])/([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z]))$"),
            // to exclude "../.." queries, add this expression at start of pattern expression: (?!([.][.]/[.][.]))
            // add milli seconds \.(\d{3})
        ) @RequestParam(value = "datetime", required = false) @Valid datetime: String?,
        // PARAMETER : q
        @Parameter(
            description = "## Text Search (q) parameter\n **OGC Parameter SHOULD**" +
                "\n\nThe list of search terms SHALL be a comma-separated list and spaces have no special meaning." +
                "\n\nKeyword searches using the `q` parameter SHALL be case insensitive." +
                "\t\n" +
                "\n\nThe specific set of text keys/fields/properties of a record to which the `q` operator is applied SHALL be left to the discretion of the implementation." +
                "\n\nThe `q` operator applies to the following core queryables:" +
                "\n\n• title\n\n• description" +
                "\n\nOnly records whose text fields contains one or more of the search terms specified using the `q` parameter SHALL be in the result set." +
                "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-q)",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @RequestParam(value = "q", required = false) @Valid qParameter: List<String>?,
        // PARAMETER : externalid
        @Parameter(
            description = "## Search by External Identifier (externalId)\n **OGC Parameter SHOULD**" +
                "\n\n### ! Not yet implemented !" +
                "\n\nAn equality predicate consistent of a comma-separated list of external resource identifiers. Only records with the specified external identifiers shall appear in the response set." +
                "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-externalid)",
            explode = Explode.FALSE,
            style = ParameterStyle.MATRIX,
        ) @RequestParam(value = "externalid", required = false) @Valid externalid: List<String>?,
        // PARAMETER : f
        @Parameter(
            description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                "\n\n• get response in JSON with value `JSON` (default). This represents the internal InGrid format. \n\n• get response in HTML with value `HTML`" +
                "\n\n• get response in XML, ISO 19139 with value `INGRID_ISO` \n\n• get response in GEOJSON with value `GEOJSON`",
        ) @RequestParam(value = "f", required = false, defaultValue = "JSON") format: RecordFormat,
        // PARAMETER : filter
        @Parameter(
            description = "## Filter\n **OGC Parameter SHOULD**" +
                "\n\n### ! Not yet implemented !" +
                "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter parameter as defined in Parameter `filter`." +
                "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter-lang parameter as defined in Parameter `filter-lang`." +
                "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter-crs parameter as defined in Parameter `filter-crs`." +
                "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#_operation_5)" +
                "\n\n[Additional Source: DRAFT OGC API - Features - Part 3: Filtering](https://docs.ogc.org/DRAFTS/19-079r1.html#_requirements_class_filter)",
        ) @RequestParam(value = "filter", required = false) filter: String?,
    ): ResponseEntity<ByteArray> {
        apiValidationService.validateCollection(collectionId)
        apiValidationService.validateRequestParams(allRequestParams, listOf("limit", "offset", "type", "bbox", "datetime", "q", "externalid", "f", "filter"))
        apiValidationService.validateBbox(bbox)

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
        // query all record details in right response format via exporter
        val records: ByteArray = ogcRecordService.prepareRecords(researchRecords, collectionId, format, links, queryMetadata)

        val responseHeaders = HttpHeaders()
        responseHeaders.add("Content-Type", format.mimeType)

        return ResponseEntity.ok().headers(responseHeaders).body(records)
    }
}
