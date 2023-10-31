package de.ingrid.igeserver.api

import com.aallam.openai.api.chat.ChatCompletion
import com.aallam.openai.api.chat.ChatCompletionRequest
import com.aallam.openai.api.chat.ChatMessage
import com.aallam.openai.api.chat.ChatRole
import com.aallam.openai.api.http.Timeout
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.OpenAI
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.QueryService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusFactory
import de.ingrid.igeserver.services.geothesaurus.GeoThesaurusSearchOptions
import de.ingrid.igeserver.services.geothesaurus.SpatialResponse
import de.ingrid.igeserver.services.thesaurus.ThesaurusSearchType
import de.ingrid.igeserver.utils.AuthUtils
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import kotlin.time.Duration.Companion.seconds

@RestController
@RequestMapping(path = ["/api/search"])
class ResearchApiController @Autowired constructor(
    val researchService: ResearchService,
    val queryService: QueryService,
    val catalogService: CatalogService,
    val authUtils: AuthUtils,
    val geoThesaurusFactory: GeoThesaurusFactory,
    val generalProperties: GeneralProperties
) : ResearchApi {
    
    override fun load(principal: Principal): ResponseEntity<List<Query>> {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val queries = queryService.getQueriesForUser(userId, catalogId)
        return ResponseEntity.ok(queries)
    }

    override fun save(principal: Principal, query: Query): ResponseEntity<Query> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = queryService.saveQuery(userId, catalogId, query)
        return ResponseEntity.ok(result)

    }

    override fun delete(principal: Principal, id: Int): ResponseEntity<Void> {
        queryService.removeQueryForUser(id)
        return ResponseEntity.ok().build()
    }

    override fun search(principal: Principal, query: ResearchQuery): ResponseEntity<ResearchResponse> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = researchService.query(catalogId, query, principal)
        return ResponseEntity.ok(result)

    }

    override fun searchSql(principal: Principal, sqlQuery: String, page: Int?, pageSize: Int?): ResponseEntity<ResearchResponse> {
        // TODO: check for invalid SQL commands (like DELETE, ...)
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val paging = if (page != null && pageSize != null) {
            ResearchPaging(page, pageSize)
        } else ResearchPaging()
        
        val result = researchService.querySql(principal, catalogId, sqlQuery, paging)
        return ResponseEntity.ok(result)
    }

    override fun getQuickFilter(principal: Principal): ResponseEntity<Facets> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val dbType = catalogService.getCatalogById(catalogId).type

        val facets = researchService.createFacetDefinitions(dbType)
        return ResponseEntity.ok(facets)
    }

    override fun export(principal: Principal): ResponseEntity<Any> {
        TODO("Not yet implemented")
    }

    override fun geoSearch(principal: Principal, query: String): ResponseEntity<List<SpatialResponse>> {
        val response = geoThesaurusFactory.get("wfsgnde").search(query, GeoThesaurusSearchOptions(ThesaurusSearchType.CONTAINS))
        return ResponseEntity.ok(response)
        
    }

    override fun aiSearch(principal: Principal, query: String): ResponseEntity<String> {
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
            // additional configurations...
        )

        val chatCompletionRequest = ChatCompletionRequest(
            model = ModelId("gpt-3.5-turbo"),
            messages = listOf(
                ChatMessage(
                    role = ChatRole.System,
                    content = "Given the following SQL tables in a Postgres database, your job is to write queries given a user’s request. create table document( id integer   default nextval('document_id_seq'::regclass) not null primary key, catalog_id integer not null references catalog on delete cascade, uuid varchar(255) not null, type varchar(255)             not null, title             varchar(4096)            not null, data jsonb); Das JSONB Feld ist so aufgebaut: { isOpenData: boolean, isInspireIdentified: boolean, isAdVCompatible: boolean, description: string, keywords: { free: {label: string}[], gemet: {label: string}[], umthes: {label: string}[] }}. Querying 'Schlüsselwort' should be searched in each JSON-field under 'keywords'. Search should be case-insensitive."
                ),
                ChatMessage(
                    role = ChatRole.User,
                    content = query
                )
            )
        )
        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)
        
        return completion.choices.firstOrNull()?.message?.content
    }

}
