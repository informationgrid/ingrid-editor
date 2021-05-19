package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ObjectNode
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.profiles.CatalogProfile
import org.hibernate.jpa.QueryHints
import org.hibernate.query.NativeQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*
import javax.persistence.EntityManager


data class Result(
    val title: String?,
    val uuid: String?,
    val _type: String?,
    val _created: Date?,
    val _modified: Date?,
    val _state: String?,
    val _category: String?,
    var hasWritePermission: Boolean?
)

@Service
class ResearchService {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var quickFilters: List<QuickFilter>

    @Autowired
    private lateinit var profiles: List<CatalogProfile>

    @Autowired
    private lateinit var aclService: IgeAclService

    private val specialFilter = arrayOf("selectPublished", "selectLatest")

    fun createFacetDefinitions(catalogType: String): Facets {
        return profiles
            .find { it.identifier == catalogType }!!
            .let { Facets(it.getFacetDefinitionsForAddresses(), it.getFacetDefinitionsForDocuments()) }

    }

    fun query(principal: Principal?, groups: Set<Group>, dbId: String, query: ResearchQuery): ResearchResponse {

        val groupIds = aclService.getDatasetUuidsFromGroups(groups, false)
        val sql = createQuery(dbId, query, groupIds)
        val parameters = getParameters(query)

        val result = sendQuery(sql, parameters)
        val map = mapResult(result)
//        val filtered = filterResultsByPermission(principal as Authentication, map.toMutableList())

        return ResearchResponse(result.size, map)
    }

    private fun filterResultsByPermission(authentication: Authentication, result: MutableList<Result>): List<Result> {
        return result.mapNotNull {
            val info = aclService.getPermissionInfo(authentication, it.uuid!!)
            val mapped = if (info.canRead) {
                it.hasWritePermission = info.canWrite
                it
            } else {
                null
            }
            mapped
        }
    }

    private fun getParameters(query: ResearchQuery): List<Any> {
        return query.clauses?.clauses
            ?.mapNotNull { it.parameter }
            ?.map { it.map { it.toFloat() } }
            ?.filter { it.isNotEmpty() }
            ?.flatten() ?: emptyList()
    }

    private fun createQuery(dbId: String, query: ResearchQuery, groupDocUuids: List<String>): String {

        val stateCondition = determineStateQuery(query.clauses)
        val jsonSearch = determineJsonSearch(query.term)
        val whereFilter = determineWhereQuery(dbId, query, groupDocUuids)

        return """
                SELECT DISTINCT document1.*, document_wrapper.draft, document_wrapper.category
                FROM catalog, acl_object_identity, document_wrapper
                $stateCondition
                $jsonSearch
                $whereFilter
                ORDER BY document1.title;
            """
    }

    private fun determineWhereQuery(dbId: String, query: ResearchQuery, groupDocUuids: List<String>): String {
        val catalogFilter = createCatalogFilter(dbId)
        val permissionFilter = " AND document_wrapper.uuid=acl_object_identity.object_id_identity AND (document_wrapper.uuid = ANY(('{${groupDocUuids.joinToString(",")}}')) OR ('{${groupDocUuids.joinToString(",")}}') && acl_object_identity.path)"
        val catalogAndPermissionFilter = catalogFilter + permissionFilter

        val termSearch =
            if (query.term == null) "" else "(t.val ILIKE '%${query.term}%' OR title ILIKE '%${query.term}%')"

        val filter = convertQuery(query.clauses)

        return if (termSearch.isBlank() && filter == null) {
            "WHERE $catalogAndPermissionFilter"
        } else if (termSearch.isBlank()) {
            "WHERE $catalogAndPermissionFilter AND $filter"
        } else if (filter == null) {
            "WHERE $catalogAndPermissionFilter AND $termSearch"
        } else {
            "WHERE $catalogAndPermissionFilter AND $filter AND $termSearch"
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

    private fun sendQuery(sql: String, parameter: List<Any>): List<Array<Any>> {
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
            .addScalar("category")
            .resultList as List<Array<Any>>
    }

    private fun mapResult(result: List<Any>): List<Result> {
        return result.map {
            val item = it as Array<out Any>
//            val node = jacksonObjectMapper().createObjectNode()
            val node: ObjectNode = item[0] as ObjectNode
            Result(
                title = item[1] as? String,
                uuid = item[2] as? String,
                _type = item[3] as? String,
                _created = item[4] as? Date,
                _modified = item[5] as? Date,
                _state = if (item[6] == null) DocumentService.DocumentState.PUBLISHED.value else DocumentService.DocumentState.DRAFT.value,
                _category = (item[7] as? String),
                hasWritePermission = false
            )
        }
    }

    fun querySql(dbId: String, sqlQuery: String): ResearchResponse {

        try {
            val catalogQuery = restrictQueryOnCatalog(dbId, sqlQuery)
            val result = sendQuery(catalogQuery, emptyList())

            return ResearchResponse(result.size, mapResult(result))
        } catch (error: Exception) {
            throw ClientException.withReason(
                (error.cause?.cause ?: error.cause)?.message ?: error.localizedMessage
            )
        }
    }

    private fun restrictQueryOnCatalog(dbId: String, sqlQuery: String): String {

        val catalogFilter = createCatalogFilter(dbId)

        val fromIndex = sqlQuery.indexOf("FROM")
        val whereIndex = sqlQuery.indexOf("WHERE")

        if (fromIndex == -1) {
            throw ClientException.withReason("Query must contain 'FROM' statement")
        }

        return when (whereIndex) {
            -1 -> """
                ${sqlQuery.substring(0, fromIndex + 4)} catalog, ${sqlQuery.substring(fromIndex + 5)}
                WHERE $catalogFilter
                """.trimIndent()
            else -> """
                ${sqlQuery.substring(0, fromIndex + 4)} catalog, ${sqlQuery.substring(fromIndex + 5, whereIndex + 5)}
                $catalogFilter AND 
                ${sqlQuery.substring(whereIndex + 6)}""".trimIndent()
        }

    }

}
