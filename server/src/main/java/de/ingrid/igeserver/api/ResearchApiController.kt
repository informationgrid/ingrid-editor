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

import com.aallam.openai.api.chat.ChatCompletion
import com.aallam.openai.api.chat.ChatCompletionRequest
import com.aallam.openai.api.chat.ChatMessage
import com.aallam.openai.api.chat.ChatRole
import com.aallam.openai.api.http.Timeout
import com.aallam.openai.api.logging.Logger
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.LoggingConfig
import com.aallam.openai.client.OpenAI
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.services.BwastrCoordinateResponse
import de.ingrid.igeserver.services.BwastrLocatorSearchResponse
import de.ingrid.igeserver.services.BwastrLocatorService
import de.ingrid.igeserver.services.BwastrSection
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.QueryService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.services.geothesaurus.BoundingBox
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusFactory
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusSearchOptions
import de.ingrid.igeserver.services.geothesaurus.SpatialResponse
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import de.ingrid.igeserver.utils.AuthUtils
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import org.springframework.cache.annotation.Cacheable
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import kotlin.time.Duration.Companion.seconds

@Hidden
@Tag(name = "Research", description = "extensive Search API")
@RestController
@RequestMapping(path = ["/api/search"])
class ResearchApiController(
    val researchService: ResearchService,
    val queryService: QueryService,
    val catalogService: CatalogService,
    val authUtils: AuthUtils,
    val geoThesaurusFactory: GeoThesaurusFactory,
    val generalProperties: GeneralProperties,
    val bwastrLocatorService: BwastrLocatorService,
) {
    private val log = logger()

    @Operation
    @GetMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ResponseBody
    fun load(principal: Principal): ResponseEntity<List<Query>> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val queries = queryService.getQueriesForUser(userId, catalogId)
        return ResponseEntity.ok(queries)
    }

    @Operation
    @PostMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun save(
        principal: Principal,
        @Parameter(
            description = "The dataset to be stored.",
            required = true,
        ) @RequestBody query: Query,
    ): ResponseEntity<Query> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = queryService.save(userId, catalogId, query)
        return ResponseEntity.ok(result)
    }

    @Operation
    @DeleteMapping(value = ["query/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun delete(
        principal: Principal,
        @Parameter(description = "The id of the query to be deleted") @PathVariable id: Int,
    ): ResponseEntity<Void> {
        queryService.remove(id)
        return ResponseEntity.ok().build()
    }

    @Operation
    @PutMapping(value = ["query/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun update(
        principal: Principal,
        @Parameter(description = "The id of the query to be updated", required = true) @PathVariable id: Int,
        @Parameter(description = "The data to be updated.", required = true) @RequestBody query: Query,
    ): ResponseEntity<Query> {
        val result = queryService.update(id, query)
        return ResponseEntity.ok(result)
    }

    @Operation
    @PostMapping(value = ["/query"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun search(
        principal: Principal,
        @Parameter(description = "the query with filter definitions") @RequestBody query: ResearchQuery,
    ): ResponseEntity<ResearchResponse> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = researchService.query(catalogId, query, principal)
        return ResponseEntity.ok(result)
    }

    @Operation
    @PostMapping(value = ["/querySql"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun searchSql(
        principal: Principal,
        @Parameter(description = "the sql query") @RequestBody sqlQuery: String,
        @Parameter(description = "the page of the results") @RequestParam page: Int?,
        @Parameter(description = "the size of the results to show") @RequestParam pageSize: Int?,
    ): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val paging = if (page != null && pageSize != null) {
            ResearchPaging(page, pageSize)
        } else {
            ResearchPaging()
        }

        val result = researchService.querySql(principal, catalogId, sqlQuery, paging)
        return ResponseEntity.ok(result)
    }

    @Operation
    @GetMapping(value = ["/quickFilter"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getQuickFilter(principal: Principal): ResponseEntity<Facets> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val dbType = catalogService.getProfileFromCatalog(catalogId).identifier

        val facets = researchService.createFacetDefinitions(dbType)
        return ResponseEntity.ok(facets)
    }

    @Operation
    @PostMapping(value = ["/geothesaurus/{id}"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun geoSearch(principal: Principal, @RequestBody query: String): ResponseEntity<List<SpatialResponse>> {
        val response =
            geoThesaurusFactory.get("wfsgnde").search(query, GeoThesaurusSearchOptions(ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(response)
    }

    @Operation
    @PostMapping(value = ["/ai"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun aiSearch(principal: Principal, @RequestBody query: String): ResponseEntity<String> {
        var answer: String? = null
        runBlocking {
            launch {
                answer = doAISearch(query)
            }
        }
        return ResponseEntity.ok(answer ?: "Error")
    }

    private suspend fun doAISearch(query: String): String? {
        if (generalProperties.openAIToken.isNullOrEmpty()) throw ServerException.withReason("No OpenAI-Token configured")

        val openAI = OpenAI(
            token = generalProperties.openAIToken!!,
            timeout = Timeout(socket = 60.seconds),
            logging = LoggingConfig(logger = Logger.Empty),
            // additional configurations...
        )

        val chatCompletionRequest = ChatCompletionRequest(
            model = ModelId("gpt-3.5-turbo"),
            messages = listOf(
                ChatMessage(
                    role = ChatRole.System,
                    content = "Given the following SQL tables in a Postgres database, your job is to write queries given a user’s request. create table document( id integer   default nextval('document_id_seq'::regclass) not null primary key, catalog_id integer not null references catalog on delete cascade, uuid varchar(255) not null, type varchar(255)             not null, title             varchar(4096)            not null, data jsonb); Das JSONB Feld ist so aufgebaut: { properties: { isOpenData: boolean, isInspireIdentified: string, isAdVCompatible: boolean, isHvd: boolean}, description: string, keywords: { free: {label: string}[], gemet: {label: string}[], umthes: {label: string}[] }}. Querying 'Schlüsselwort' should be searched in each JSON-field under 'keywords'. Search should be case-insensitive. The field 'isInspireIdentified' can have the following values: relevant, conform, notConform. A dataset is INSPIRE relevant if the field 'isInspireIdentified' contains any value.",
                ),
                ChatMessage(
                    role = ChatRole.User,
                    content = query,
                ),
            ),
        )
        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)

        return completion.choices.firstOrNull()?.message?.content
    }

    @Operation
    @PostMapping(value = ["/bwastr"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    @Cacheable(value = ["bwastrSearchCache"], key = "#query")
    fun bwastrSearch(principal: Principal, @RequestBody query: String): ResponseEntity<List<BwastrLocatorSearchResponse>> {
        val response = bwastrLocatorService.search(query)
        return ResponseEntity.ok(response)
    }

    @Operation
    @PostMapping(value = ["/bwastr/coordinates"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "")])
    @Cacheable(value = ["bwastrCoordinatesCache"], key = "#section")
    fun bwastrCoordinateSearch(principal: Principal, @RequestBody section: BwastrSection): ResponseEntity<BwastrCoordinateResponse> {
        try {
            val coordinates = bwastrLocatorService.getCoordinates(section)
            val longitudes = coordinates.flatten().map { it[0] }
            val latitudes = coordinates.flatten().map { it[1] }
            val bounds = BoundingBox(
                latitudes.minOrNull() ?: 0.0,
                longitudes.minOrNull() ?: 0.0,
                latitudes.maxOrNull() ?: 0.0,
                longitudes.maxOrNull() ?: 0.0,
            )
            return ResponseEntity.ok(BwastrCoordinateResponse(coordinates, bounds))
        } catch (e: Exception) {
            log.debug("Error while getting coordinates for section $section", e)
            return ResponseEntity.noContent().build()
        }
    }
}
