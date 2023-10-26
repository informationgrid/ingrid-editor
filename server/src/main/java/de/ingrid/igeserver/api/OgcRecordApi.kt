package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.RecordCollection
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.enums.Explode
import io.swagger.v3.oas.annotations.enums.ParameterStyle
import io.swagger.v3.oas.annotations.media.ArraySchema
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.util.*

@Tag(name = "Ogc Api Records", description = "OGC API - Records")
interface OgcApiRecords {



    @GetMapping(value = ["/collections"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(responses = [], summary = "Get all Catalogs", hidden = false)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun getCatalogs(
            principal: Principal,
            @Parameter(description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
            "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
            "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
            "\n\n• get response in JSON with value `internal` (default) \n\n• get response in HTML with value `html`" +
            "\n\n\n### To Do:\n\n• format of Time (created, updated)"
            ) @RequestParam(value = "f", required = false) format: String?,
    ): ResponseEntity<ByteArray>



    @GetMapping(value = ["/collections/{collectionId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(responses = [], summary = "Get Catalog by ID", hidden = false)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun getCatalog(
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                    "\n\n### ! Not yet implemented !" +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                    "\n\n### Supported formats \n\nWhile OGC API Records does not specify any mandatory encoding, support for the following encodings is given: " +
                    "\n\n• get response in JSON with value `internal` (default) \n\n• get response in HTML with value `html`" +
                    "\n\n\n### To Do:\n\n• format of Time (created, updated)"
            ) @RequestParam(value = "f", required = false) format: String?,
    ): ResponseEntity<ByteArray>



    @GetMapping(value = ["/collections/{collectionId}/items"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(responses = [], summary = "fetch records", hidden = true,
            description = "# Fetch Records\n\nFetch records of the catalog with id `collectionId`." +
                    "As specified in the [Records Access](https://docs.ogc.org/DRAFTS/20-004.html#records-access) clause, records are accessed using the HTTP GET method via the /collections/{collectionId}/items path." +
                    "\n\n\n\n## Currently working on profile: **Ingrid**"
    )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun getRecords(
            principal: Authentication,
            // PARAMETER : collectionId
            @Parameter(description = "## Collection ID \n **OGC Parameter**" +
                    "\n\n The identifier for a specific record collection (i.e. catalogue identifier).",
                    required = true
            ) @Valid @PathVariable("collectionId") collectionId: String,
            // PARAMETER : limit
            @Parameter(description = "## Paging: Limit of requested Records \n **OGC Parameter SHOULD**" +
                    "\n\nThe number of records to be presented in a response document." +
                    "\n\n• defaultLimit = 10" +
                    "\n\n• maxLimit = Int.MAX_VALUE" +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#local-resources-catalogue-limit-param)"
            ) @RequestParam(value = "limit", required = false) limit: Int?,
            // PARAMETER : offset
            @Parameter(description = "## Paging: Offset of requested Records\n **OGC Parameter SHOULD**" +
                    "\n\n**Reference from Feature Collection:** If the request is to return building features and \"10\" is the default `limit`, the links in the response could be (in this example represented as link headers and using an additional parameter `offset` to implement next links - and the optional prev links)" +
                    "\n\n[Source: OGC API - Features - Part 1: Core](https://docs.ogc.org/is/17-069r3/17-069r3.html#_response_6)"
            ) @RequestParam(value = "offset", required = false) offset: Int?,
            // PARAMETER : type
            @Parameter(description = "## Document Type\n **OGC Parameter SHOULD**" +
                    "\n\nAn equality predicate consistent of a comma-separated list of resource types. Only records of the listed type shall appear in the resource set." +
                    "\n\nOnly records whose type, as indicated by the value of the `type` core queryable, is equal to one of the listed values specified using the `type` parameter SHALL be in the result set." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-type)" +
                    "\n\n### To do:" +
                    "\n\n• The definition of the `type` parameter SHOULD be extended to enumerate the list of known record types." +
                    "\n\n• Die Definition des Parameters `type`SOLLTE erweitert werden, um die Liste bekannter Datensatztypen aufzulisten.",
                    explode = Explode.FALSE,
                    style = ParameterStyle.MATRIX,
            ) @RequestParam(value = "type", required = false) type: List<String>?,
            // PARAMETER : bbox
            @Parameter(description = "## Bounding Box\n **OGC ParameterSHOULD**" +
                    "\n\nA bounding box. If the spatial extent of the record intersects the specified bounding box then the record shall be presented in the response document." +
                    "\n\nThe `bbox` array requires 4 numbers in order:" +
                    "\n\n1. Lower left Corner, Longitude" +
                    "\n\n2. Lower Left Corner, Latitude" +
                    "\n\n3. Upper Right Corner, Longitude" +
                    "\n\n4. Upper Right Corner, Latitude" +
                    "\n\n[Source: OGC API - Features - Part 1: Core corrigendum](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_bbox)"
                    , explode = Explode.FALSE, style = ParameterStyle.MATRIX
            ) @ArraySchema(minItems = 4, maxItems = 4) @RequestParam(value = "bbox", required = false) bbox: List<Float>?,
            // PARAMETER : datetime
            @Parameter(description = "## Time span\n **OGC Parameter SHOULD**" +
                    "\n\nA time instance or time period. If the temporal extent of the record intersects the specified data/time value then the record shall be presented in the response document. " +
                    "Either a date-time or an interval, open or closed. Date and time expressions adhere to RFC 3339. Open intervals are expressed using double-dots.  " +
                    "\n\nOnly records that have a temporal property that intersects the value of `datetime` are selected. " +
                    "\n\nExamples:  " +
                    "\n\n• A closed interval: \"2023-08-02T00:00:00Z/2023-08-05T23:59:59Z\" " +
                    "\n\n• Open intervals (all records from): \"2023-08-2T00:00:00Z/..\" " +
                    "\n\n• Open intervals (all records until): \"../2023-08-05T23:59:59Z\" " +
                    "\n\n[Source: OGC API - Features - Part 1: Core corrigendum](https://docs.ogc.org/is/17-069r4/17-069r4.html#_parameter_datetime)" +
                    "\n\n### To Do:" +
                    "\n\n• check time intersections" +
                    "\n\n• Unterschied: time instance or time period",
                    explode = Explode.FALSE,
                    style = ParameterStyle.MATRIX,
                    schema = Schema(pattern = "^(([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z])/([.][.]|\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):([0-5]\\d):([0-5]\\d)[Z]))$" )
                    // to exclude "../.." queries, add this expression at start of pattern expression: (?!([.][.]/[.][.]))
                    // add milli seconds \.(\d{3})
            ) @RequestParam(value = "datetime", required = false) @Valid datetime: String?,
            // PARAMETER : q
            @Parameter(description = "## Text Search (q) parameter\n **OGC Parameter SHOULD**" +
                    "\n\n### ! Not yet implemented !" +
                    "\n\nA Records API SHALL support the Text Search (q) parameter for the operation." +
                    "\n\nThe list of search terms SHALL be a comma-separated list and spaces have no special meaning." +
                    "\n\nKeyword searches using the `q` parameter SHALL be case insensitive." +
                    "\t\n" +
                    "\n\nThe specific set of text keys/fields/properties of a record to which the `q` operator is applied SHALL be left to the discretion of the implementation." +
                    "\n\nThe `q` operator SHOULD at least be applied to the following core queryables:" +
                    "\n\n• title\n\n• description\n\n• keywords" +
                    "\n\nOnly records whose text fields contains one or more of the search terms specified using the `q` parameter SHALL be in the result set." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-q)",
                    explode = Explode.FALSE,
                    style = ParameterStyle.MATRIX,
            ) @RequestParam(value = "q", required = false) @Valid q: List<String>?,

            // ------- NOT YET IMPlEMENTED -------
            // PARAMETER : externalid
            @Parameter(description = "## Search by External Identifier (externalId)\n **OGC Parameter SHOULD**" +
                    "\n\n### ! Not yet implemented !" +
                    "\n\nAn equality predicate consistent of a comma-separated list of external resource identifiers. Only records with the specified external identifiers shall appear in the response set." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#core-query-parameters-externalid)",
                    explode = Explode.FALSE,
                    style = ParameterStyle.MATRIX,
            ) @RequestParam(value = "externalid", required = false) @Valid externalid: List<String>?,
            // PARAMETER : f
            @Parameter(description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                    "\n\n### ! Not yet implemented !" +
                    "\n\nWhile OGC API - Records does not specify any mandatory encoding, support for the following encodings is recommended." +
                    "\n\nTo support browsing the catalogue and its records with a web browser and to enable search engines to crawl and index the catalogue, implementations SHOULD consider supporting an HTML encoding." +
                    "\n\nIf the records can be represented for the intended use in GeoJSON, implementations SHOULD consider supporting GeoJSON as an encoding for records and catalogues (i.e. record collections)." +
                    "\n\nIf a catalogue (i.e. record collection) can be represented for the intended use in JSON, implementations SHOULD consider supporting JSON as an encoding for a catalogue (i.e. record collection)." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                    "\n\n### Supported formats: \n\n• get response in JSON with value 'internal' \n\n• get response in HTML with value 'html'"
            ) @RequestParam(value = "f", required = false) format: String?,
            // PARAMETER : filter
            @Parameter(description = "## Filter\n **OGC Parameter SHOULD**" +
                    "\n\n### ! Not yet implemented !" +
                    "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter parameter as defined in Parameter `filter`." +
                    "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter-lang parameter as defined in Parameter `filter-lang`." +
                    "\n\nThe HTTP GET operation on the /collections/{collectionId}/items path SHALL support the filter-crs parameter as defined in Parameter `filter-crs`." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1: Core](https://docs.ogc.org/DRAFTS/20-004.html#_operation_5)" +
                    "\n\n[Additional Source: DRAFT OGC API - Features - Part 3: Filtering](https://docs.ogc.org/DRAFTS/19-079r1.html#_requirements_class_filter)"
            ) @RequestParam(value = "filter", required = false) filter: String?,
            ): ResponseEntity<ByteArray>


    @GetMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(responses = [], summary = "Get one Record by ID of Catalog by ID", hidden = true,
        description = "# Fetch a Record" +
                "" +
                "\n\n### A 200-response SHALL include the following links in the response:\n" +
                "\n\na link to the response document (relation: self),\n" +
                "\n\na link to the response document in every other media type supported by the service (relation: alternate), and\n" +
                "\n\na link to the feature collection that contains this feature (relation: collection)." +
                "\n\nAll links in that response where rel is self, alternate, or collection SHALL include the type link parameter." +
                "\n\n[Source: OGC API - Features - Part 1: Core](https://docs.ogc.org/DRAFTS/17-069r5.html#_response_6)" +
                "\n\n## Currently working on profile: **Ingrid**"
    )
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun getRecord(
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @Valid @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
            @Parameter(description = "## Encodings: Response Format\n **OGC Parameter SHOULD**" +
                    "\n\nWhile OGC API - Records does not specify any mandatory encoding, support for the following encodings is recommended." +
                    "\n\nTo support browsing the catalogue and its records with a web browser and to enable search engines to crawl and index the catalogue, implementations SHOULD consider supporting an HTML encoding." +
                    "\n\nIf the records can be represented for the intended use in GeoJSON, implementations SHOULD consider supporting GeoJSON as an encoding for records and catalogues (i.e. record collections)." +
                    "\n\nIf a catalogue (i.e. record collection) can be represented for the intended use in JSON, implementations SHOULD consider supporting JSON as an encoding for a catalogue (i.e. record collection)." +
                    "\n\n[Source: DRAFT OGC API - Records - Part 1](https://docs.ogc.org/DRAFTS/20-004.html#_encodings_2)" +
                    "\n\n### Example: \n\n• get response in JSON with value 'internal' \n\n• get response in HTML with value 'html'\n\n• get response in ISO with value 'ingridISO' \n\n get response in IDF JSON with value 'indexInGridIDF'"
            ) @RequestParam(value = "f", required = false) format: String?,
    ): ResponseEntity<ByteArray>



    @DeleteMapping(value = ["/collections/{collectionId}/items/{recordId}"], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(responses = [], summary = "Remove a resource from a collection. (Delete Record)", hidden = true)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation"),
        ApiResponse(responseCode = "204", description = "Successful operation"),
        ApiResponse(responseCode = "400", description = "Invalid input"),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun deleteDataset(
            principal: Principal,
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
    ): ResponseEntity<Void>



    @PostMapping(value = ["/collections/{collectionId}/items"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(summary = "Add a new resource instance to a collection. (Import Record)", hidden = true)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    fun postDataset(
            @RequestHeader allHeaders: Map<String, String>,
            principal: Authentication,
            @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier)." , required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The dataset to be stored.", required = true) @RequestBody data: String,
            @Parameter(description = "## Dataset Folder ID \n **Custom Parameter** \n\n Add Dataset to Folder with UUID") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
            @Parameter(description = "## Address Folder ID \n **Custom Parameter** \n\n Add Address to Folder with UUID") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
            ): ResponseEntity<JsonNode>



    @PutMapping(value = ["/collections/{collectionId}/items/{recordId}"], consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_JSON_VALUE, MediaType.TEXT_HTML_VALUE, MediaType.APPLICATION_XML_VALUE])
    @Operation(summary = "Replace an existing resource in a collection with a replacement resource with the same resource identifier. (Update Record)", hidden = true)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "The stored dataset, which might contain additional storage information."),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")]
    )
    fun putDataset(
            @RequestHeader allHeaders: Map<String, String>,
            principal: Authentication,
            @Parameter(description = "The identifier for a specific record collection (i.e. catalogue identifier).", required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The identifier for a specific record within a collection.", required = true) @Valid @PathVariable("recordId") recordId: String,
            @Parameter(description = "The data to be stored.", required = true) @RequestBody data: String,
    ): ResponseEntity<JsonNode>

    @PostMapping(value = ["collections/{collectionId}/cswt"], consumes = [MediaType.APPLICATION_XML_VALUE], produces = [MediaType.APPLICATION_XML_VALUE])
    @Operation(summary = "Insert, Update, Delete Records via CSW-t", hidden = true)
    @ApiResponses(value = [
        ApiResponse(responseCode = "200", description = "Successful operation."),
        ApiResponse(responseCode = "404", description = "Not found"),
        ApiResponse(responseCode = "500", description = "Unexpected error")
    ])
    fun handleCSWT(
            @RequestHeader allHeaders: Map<String, String>,
            principal: Authentication,
            @Parameter(description = "## Collection ID \n **OGC Parameter** \n\n The identifier for a specific record collection (i.e. catalogue identifier)." , required = true) @PathVariable("collectionId") collectionId: String,
            @Parameter(description = "The datasets to be inserted, delete or updated.", required = true) @RequestBody data: String,
            @Parameter(description = "## Dataset Folder ID \n **Custom Parameter** \n\n Add Dataset to Folder with UUID") @RequestParam(value = "datasetFolderId", required = false) datasetFolderId: String?,
            @Parameter(description = "## Address Folder ID \n **Custom Parameter** \n\n Add Address to Folder with UUID") @RequestParam(value = "addressFolderId", required = false) addressFolderId: String?,
            ): ResponseEntity<ByteArray>


}