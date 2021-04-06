package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.profiles.CatalogProfile
import org.hibernate.exception.GenericJDBCException
import org.hibernate.jpa.QueryHints
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*
import javax.persistence.EntityManager

@Service
class ResearchService {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var quickFilters: List<QuickFilter>

    @Autowired
    private lateinit var profiles: List<CatalogProfile>

    private val specialFilter = arrayOf("selectPublished", "selectLatest")

    fun createFacetDefinitions(catalogType: String): Array<FacetGroup> {
        return profiles
            .find { it.identifier == catalogType }
            ?.getFacetDefinitions() ?: emptyArray()

    }

    fun query(dbId: String, query: ResearchQuery): ResearchResponse {

        val sql = createQuery(dbId, query)
        val parameters = getParameters(query)

        val result = sendQuery(sql, parameters)

        return ResearchResponse(result.size, mapResult(result))
    }

    private fun getParameters(query: ResearchQuery): List<Any> {
        return query.clauses?.clauses
            ?.mapNotNull { it.parameter }
            ?.map { it.map { it.toFloat() } }
            ?.filter { it.isNotEmpty() }
            ?.flatten() ?: emptyList()
    }

    private fun createQuery(dbId: String, query: ResearchQuery): String {

        val stateCondition = determineStateQuery(query.clauses)
        val jsonSearch = determineJsonSearch(query.term)
        val whereFilter = determineWhereQuery(dbId, query)

        return """
                SELECT DISTINCT document1.*, document_wrapper.draft
                FROM catalog, document_wrapper
                $stateCondition
                $jsonSearch
                $whereFilter
                ORDER BY document1.title;
            """
    }

    private fun determineWhereQuery(dbId: String, query: ResearchQuery): String {
        val catalogFilter = createCatalogFilter(dbId);
        
        val termSearch = if (query.term == null) "" else "(t.val ILIKE '%${query.term}%' OR title ILIKE '%${query.term}%')"

        val filter = convertQuery(query.clauses)
        
        return if (termSearch.isBlank() && filter == null) {
            "WHERE $catalogFilter" 
        } else if (termSearch.isBlank()) {
            "WHERE $catalogFilter AND $filter"
        } else if (filter == null){
            "WHERE $catalogFilter AND $termSearch"
        } else {
            "WHERE $catalogFilter AND $filter AND $termSearch"
        }
    }

    private fun createCatalogFilter(dbId: String): String {
        
        return "document_wrapper.catalog_id = catalog.id AND catalog.identifier = '$dbId'"
        
    }

    private fun determineJsonSearch(term: String?): String {

        return if (term != null)
            "CROSS JOIN LATERAL jsonb_each_text(document1.data) as t(k, val)"
        else ""

    }

    private fun convertQuery(boolFilter: BoolFilter?): String? {

        if (boolFilter == null) {
            return null
        }

        val filterString: List<String?>? = if (boolFilter.clauses != null && boolFilter.clauses.isNotEmpty()) {
            boolFilter.clauses
                .mapNotNull { convertQuery(it) }
        } else {
            boolFilter.value
                ?.filter { !specialFilter.contains(it) }
                ?.map { reqFilterId -> quickFilters.find { it.id == reqFilterId } }
                ?.map { it?.filter }
        }

        return when (filterString?.size) {
            0 -> null
            else -> "(${filterString?.joinToString(" ${boolFilter.op} ")})"
        }

    }

    private fun findSpecialFilter(boolFilter: BoolFilter?): List<String>? {

        if (boolFilter == null) {
            return null
        }

        return if (boolFilter.clauses != null && boolFilter.clauses.isNotEmpty()) {
            boolFilter.clauses
                .mapNotNull { findSpecialFilter(it) }
                .flatten()
        } else {
            boolFilter.value
                ?.filter { specialFilter.contains(it) }
        }

    }

    private fun determineStateQuery(filter: BoolFilter?): Any {
        val result = findSpecialFilter(filter)

        val searchPublished = result?.find { it == "selectPublished" }
        return if (searchPublished != null) {
            "JOIN document document1 ON document_wrapper.published = document1.id"
        } else {
            """
            JOIN document document1 ON
                CASE
                    WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                    ELSE document_wrapper.draft = document1.id
                END
            """.trimIndent()
        }

    }

    private fun sendQuery(sql: String, parameter: List<Any>): List<Any> {
        val nativeQuery = entityManager.createNativeQuery(sql)

        for ((index, it) in parameter.withIndex()) {
            nativeQuery.setParameter(index + 1, it)
        }

        return nativeQuery
            .setHint(QueryHints.HINT_READONLY, true)
            .unwrap(NativeQuery::class.java)
            .addScalar("data", JsonNodeBinaryType.INSTANCE)
            .addScalar("title")
            .addScalar("uuid")
            .addScalar("type")
            .addScalar("created")
            .addScalar("modified")
            .addScalar("draft")
            .resultList
    }

    private fun mapResult(result: List<Any>): ArrayNode {
        val array = jacksonObjectMapper().createArrayNode()
        val jsonNodes = result.map {
            val item = it as Array<out Any>
//            val node = jacksonObjectMapper().createObjectNode()
            val node: ObjectNode = item[0] as ObjectNode
            node.put("title", item[1] as? String)
            node.put("uuid", item[2] as? String)
            node.put("_type", item[3] as? String)
            node.put("_created", (item[4] as? Date).toString())
            node.put("_modified", (item[5] as? Date).toString())
            node.put("_state", if (item[6] == null) DocumentService.DocumentState.PUBLISHED.value else DocumentService.DocumentState.DRAFT.value)
        }
        array.addAll(jsonNodes)
        return array
    }

    fun querySql(dbId: String, sqlQuery: String): ResearchResponse {

        try {
            val catalogQuery = restrictQueryOnCatalog(dbId, sqlQuery)
            val result = sendQuery(catalogQuery, emptyList())

            return ResearchResponse(result.size, mapResult(result))
        } catch (error: GenericJDBCException) {
            throw NotFoundException.withMissingResource(error.localizedMessage, "SQL")
        }
    }

    private fun restrictQueryOnCatalog(dbId: String, sqlQuery: String): String {

        val catalogFilter = createCatalogFilter(dbId)

        val fromIndex = sqlQuery.indexOf("FROM")
        val whereIndex = sqlQuery.indexOf("WHERE")
        return """
            ${sqlQuery.substring(0, fromIndex + 4)} catalog, ${sqlQuery.substring(fromIndex + 5, whereIndex + 5)}
            $catalogFilter AND 
            ${sqlQuery.substring(whereIndex + 6)}""".trimIndent()

    }

}
