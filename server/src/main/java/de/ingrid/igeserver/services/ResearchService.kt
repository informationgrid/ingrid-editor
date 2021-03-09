package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.profiles.CatalogProfile
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
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

    fun query(query: ResearchQuery): ResearchResponse {

        val sql = createQuery(query)

        val result = sendQuery(sql)

        return ResearchResponse(result.size, mapResult(result))
    }

    private fun createQuery(query: ResearchQuery): String {
        val filter = convertQuery(query.clauses)
        val whereFilter = when (filter) {
            null -> ""
            else -> "WHERE $filter"
        }

        val stateCondition = determineStateQuery(query.clauses)

        return """
                SELECT *
                FROM document_wrapper
                $stateCondition
                $whereFilter;
            """
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

    private fun sendQuery(sql: String) = entityManager
        .createNativeQuery(sql)
        .unwrap(NativeQuery::class.java)
        .addScalar("data", JsonNodeBinaryType.INSTANCE)
        .addScalar("title")
        .addScalar("uuid")
        .addScalar("type")
        .addScalar("created")
        .addScalar("modified")
        .resultList

    private fun mapResult(result: List<Any>): ArrayNode {
        val array = jacksonObjectMapper().createArrayNode()
        val jsonNodes = result.map {
            val item = it as Array<out Any>
            val node = jacksonObjectMapper().createObjectNode()
            node.put("title", item[1] as? String)
            node.put("uuid", item[2] as? String)
        }
        array.addAll(jsonNodes)
        return array
    }

    fun querySql(sqlQuery: String): ResearchResponse {

        val result = sendQuery(sqlQuery)

        return ResearchResponse(result.size, mapResult(result))
        
    }

}
