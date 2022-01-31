package de.ingrid.igeserver.services

import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.utils.AuthUtils
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
    val _id: Int,
    val _uuid: String?,
    val _type: String?,
    val _created: Date?,
    val _modified: Date?,
    val _state: String?,
    val _category: String?,
    var hasWritePermission: Boolean?,
    var hasOnlySubtreeWritePermission: Boolean?
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

    @Autowired
    private lateinit var authUtils: AuthUtils

    fun createFacetDefinitions(catalogType: String): Facets {
        return profiles
            .find { it.identifier == catalogType }!!
            .let { Facets(it.getFacetDefinitionsForAddresses(), it.getFacetDefinitionsForDocuments()) }

    }

    fun query(principal: Principal, groups: Set<Group>, catalogId: String, query: ResearchQuery): ResearchResponse {

        val isAdmin = authUtils.isAdmin(principal)
        val groupIds = if (isAdmin) emptyList() else aclService.getAllDatasetUuidsFromGroups(groups)

        // if a user has no groups then user is not allowed anything
        if (groupIds.isEmpty() && !isAdmin) {
            return ResearchResponse(0, emptyList())
        }

        val sql = createQuery(catalogId, query, groupIds)
        val parameters = getParameters(query)

        val result = sendQuery(sql, parameters, query.pagination)
        val map = filterAndMapResult(result, isAdmin, principal)

        return ResearchResponse(map.size, map)
    }

    private fun getParameters(query: ResearchQuery): List<Any> {

        val termParameters: List<Any> = if (query.term.isNullOrEmpty()) {
            emptyList()
        } else {
            val withWildcard = "%" + query.term + "%"
            // third parameter is for uuid search and so must not contain wildcard
            listOf(withWildcard, withWildcard, query.term)
        }

        val clauseParameters = query.clauses?.clauses
            ?.mapNotNull { it.parameter }
            ?.map { it.mapNotNull { it?.toFloatOrNull() ?: it } }
            ?.filter { it.isNotEmpty() }
            ?.flatten() ?: emptyList()

        return termParameters + clauseParameters
    }

    private fun createQuery(catalogId: String, query: ResearchQuery, groupDocUuids: List<Int>): String {

        return """
                SELECT DISTINCT document1.*, document_wrapper.draft, document_wrapper.published, document_wrapper.category, document_wrapper.id as wrapperid
                FROM catalog, document_wrapper
                ${createFromStatement()}
                ${determineJsonSearch(query.term)}
                ${determineWhereQuery(catalogId, query, groupDocUuids)}
                ORDER BY document1.${query.orderByField} ${query.orderByDirection}
            """
    }

    private fun determineWhereQuery(catalogId: String, query: ResearchQuery, groupDocIds: List<Int>): String {
        val catalogFilter = createCatalogFilter(catalogId)
        val groupDocIdsString = groupDocIds.joinToString(",")
        // TODO: uuid IN (SELECT(unnest(dw.path))) might be more performant (https://coderwall.com/p/jmtskw/use-in-instead-of-any-in-postgresql)
        val permissionFilter = if (groupDocIds.isEmpty()) "" else
            """ AND (document_wrapper.id = ANY(('{$groupDocIdsString}')) 
                    OR ('{$groupDocIdsString}') && document_wrapper.path)
            """.trimIndent()

        val deletedFilter = "document_wrapper.deleted = 0 AND "
        val catalogAndPermissionFilter = deletedFilter + catalogFilter + permissionFilter

        val termSearch =
            if (query.term.isNullOrEmpty()) "" else "(t.val ILIKE ? OR title ILIKE ? OR document_wrapper.uuid ILIKE ? )"

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

    private fun createCatalogFilter(catalogId: String): String {

        return "document_wrapper.catalog_id = catalog.id AND catalog.identifier = '$catalogId' "

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
        } else if (boolFilter.isFacet) {
            boolFilter.value
                ?.map { reqFilterId -> quickFilters.find { it.id == reqFilterId } }
                ?.map { it?.filter(boolFilter.parameter) }
        } else {
            boolFilter.value
        }

        return when (filterString?.size) {
            0 -> null
            else -> "(${filterString?.joinToString(" ${boolFilter.op} ")})"
        }

    }

    private fun createFromStatement(): Any {
        return """
            JOIN document document1 ON
                CASE
                    WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                    ELSE document_wrapper.draft = document1.id
                END
            """.trimIndent()
    }

    private fun sendQuery(sql: String, parameter: List<Any>, paging: ResearchPaging): List<Array<out Any?>> {
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
            .addScalar("published")
            .addScalar("category")
            .addScalar("wrapperid")
            .setFirstResult((paging.page - 1) * paging.pageSize)
            .setMaxResults(paging.pageSize)
            .resultList as List<Array<out Any?>>
    }

    private fun filterAndMapResult(
        result: List<Array<out Any?>>,
        isAdmin: Boolean,
        principal: Principal
    ): List<Result> {
        principal as Authentication
        return result.filter { item ->
            isAdmin || aclService.getPermissionInfo(
                principal,
                item[9] as Int // "id"
            ).canRead
        }.map { item ->
            Result(
                title = item[1] as? String,
                _uuid = item[2] as? String,
                _type = item[3] as? String,
                _created = item[4] as? Date,
                _modified = item[5] as? Date,
                _state = determineDocumentState(item),
                _category = (item[8] as? String),
                hasWritePermission = if (isAdmin) true else aclService.getPermissionInfo(
                    principal,
                    item[9] as Int
                ).canWrite,
                hasOnlySubtreeWritePermission = if (isAdmin) false else aclService.getPermissionInfo(
                    principal,
                    item[9] as Int
                ).canOnlyWriteSubtree,
                _id = item[9] as Int
            )
        }
    }

    private fun determineDocumentState(item: Array<out Any?>) =
        if (item[6] == null) DocumentService.DocumentState.PUBLISHED.value
        else if (item[7] == null) DocumentService.DocumentState.DRAFT.value
        else DocumentService.DocumentState.DRAFT_AND_PUBLISHED.value

    fun querySql(principal: Principal, catalogId: String, sqlQuery: String): ResearchResponse {

        val isAdmin = authUtils.isAdmin(principal)
        var finalQuery = ""
        try {
            assertValidQuery(sqlQuery)
            val catalogQuery = restrictQueryOnCatalog(catalogId, sqlQuery)
            finalQuery = addWrapperIdToQuery(catalogQuery)

            val result = sendQuery(finalQuery, emptyList(), ResearchPaging())
            val map = filterAndMapResult(result, isAdmin, principal)

            return ResearchResponse(map.size, map)
        } catch (error: Exception) {
            throw ClientException.withReason(
                (error.cause?.cause ?: error.cause)?.message ?: error.localizedMessage,
                data = mapOf("sql" to finalQuery)
            )
        }
    }

    private fun assertValidQuery(sqlQuery: String) {
        val fromIndex = sqlQuery.indexOf("FROM")
        if (fromIndex == -1) {
            throw ClientException.withReason("Query must contain 'FROM' statement")
        }

        // TODO: UPDATE AND DELETE IS NOT ALLOWED!
    }

    private fun addWrapperIdToQuery(query: String): String {
        val fromIndex = query.indexOf("FROM")
        return """
            ${query.substring(0, fromIndex)}, document_wrapper.id as wrapperid ${query.substring(fromIndex)}
        """.trimIndent()
    }

    private fun restrictQueryOnCatalog(catalogId: String, sqlQuery: String): String {

        val catalogFilter = createCatalogFilter(catalogId)

        val fromIndex = sqlQuery.indexOf("FROM")

        return when (val whereIndex = sqlQuery.indexOf("WHERE")) {
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
