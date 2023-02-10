package de.ingrid.igeserver.services

import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
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

        val hasAccessToRootDocs = authUtils.isAdmin(principal) || hasRootAccess(groups)
        val groupIds = if (hasAccessToRootDocs) emptyList() else aclService.getAllDatasetIdsFromGroups(groups)

        // if a user has no groups then user is not allowed anything
        if (groupIds.isEmpty() && !hasAccessToRootDocs) {
            return ResearchResponse(0, emptyList())
        }

        val sql = createQuery(catalogId, query, groupIds)

        val termAsParameters = getParameters(query)
        val result = sendQuery(sql, termAsParameters, query.pagination)
        val map = filterAndMapResult(result, hasAccessToRootDocs, principal)

        val totalHits = if (query.pagination.pageSize != Int.MAX_VALUE) {
            getTotalHits(sql, termAsParameters)
        } else {
            map.size
        }

        return ResearchResponse(totalHits, map)
    }

    private fun hasRootAccess(groups: Set<Group>) =
        groups.any { listOf(RootPermissionType.READ, RootPermissionType.WRITE).contains(it.permissions?.rootPermission) }

    private fun getParameters(query: ResearchQuery): List<Any> {

        return if (query.term.isNullOrEmpty()) {
            emptyList()
        } else {
            val withWildcard = "%" + query.term + "%"
            // third parameter is for uuid search and so must not contain wildcard
            if (checkForTitleSearch(query.clauses)) listOf(withWildcard)
            else listOf(withWildcard, withWildcard, query.term)
        }

    }

    private fun createQuery(catalogId: String, query: ResearchQuery, groupDocUuids: List<Int>): String {

        return """
                SELECT DISTINCT document1.*, document_wrapper.category, document_wrapper.id as wrapperid
                FROM catalog, document_wrapper Left Outer Join document document1 on document_wrapper.uuid = document1.uuid
                ${determineJsonSearch(query.term)}
                ${determineWhereQuery(catalogId, query, groupDocUuids)}
            """ + if (query.orderByField != null) """
                ORDER BY document1.${query.orderByField} ${query.orderByDirection}
            """.trimIndent() else ""
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

        // if we don't look explicitly for published state then look by default for latest version
        val latestFilter = if (!checkForPublishedSearch(query.clauses)) "document1.is_latest = true AND " else ""
        val catalogAndPermissionFilter = deletedFilter + latestFilter + catalogFilter + permissionFilter

        val termSearch = convertSearchTerm(query)

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

    private fun convertSearchTerm(query: ResearchQuery): String {
        if (query.term.isNullOrEmpty()) return ""

        val searchOnlyInTitle = checkForTitleSearch(query.clauses)
        return if (searchOnlyInTitle) "title ILIKE ?"
        else "(t.val ILIKE ? OR title ILIKE ? OR document1.uuid ILIKE ?)"
    }

    private fun checkForTitleSearch(clauses: BoolFilter?): Boolean {
        if (clauses == null) {
            return false
        }

        val filterString: List<Boolean> = if (clauses.clauses != null && clauses.clauses.isNotEmpty()) {
            clauses.clauses.map { checkForTitleSearch(it) }
        } else if (clauses.isFacet) {
            clauses.value
                ?.map { reqFilterId -> quickFilters.find { it.id == reqFilterId } }
                ?.map { it?.isFieldQuery ?: false } ?: listOf()
        } else listOf(false)

        return filterString.any { it }
    }

    private fun checkForPublishedSearch(clauses: BoolFilter?): Boolean {
        if (clauses == null) {
            return false
        }

        val filterString: List<Boolean> = if (clauses.clauses != null && clauses.clauses.isNotEmpty()) {
            clauses.clauses.map { checkForPublishedSearch(it) }
        } else if (clauses.isFacet) {
            clauses.value
                ?.map { reqFilterId -> quickFilters.find { it.id == reqFilterId } }
                ?.map { it?.id == "selectPublished" } ?: listOf()
        } else listOf(false)

        return filterString.any { it }
    }

    private fun createCatalogFilter(catalogId: String): String {

        return "document_wrapper.catalog_id = catalog.id AND catalog.identifier = '$catalogId' "

    }

    private fun determineJsonSearch(term: String?): String {

        return if (!term.isNullOrEmpty())
            "CROSS JOIN LATERAL jsonb_each_text(document1.data) as t(k, val)"
        else ""

    }

    private fun convertQuery(boolFilter: BoolFilter?): String? {

        if (boolFilter == null) {
            return null
        }

        val filterString: List<String?>? = if (!boolFilter.clauses.isNullOrEmpty()) {
            boolFilter.clauses.mapNotNull { convertQuery(it) }
        } else if (boolFilter.isFacet) {
            boolFilter.value
                ?.map { reqFilterId -> quickFilters.find { it.id == reqFilterId } }
                ?.filter { it?.isFieldQuery == false }
                ?.map { it?.filter(boolFilter.parameter) }
        } else {
            boolFilter.value
        }

        return when (filterString?.size) {
            0 -> null
            else -> "(${filterString?.joinToString(" ${boolFilter.op} ")})"
        }

    }

    private fun sendQuery(sql: String, parameter: List<Any>, paging: ResearchPaging): List<Array<out Any?>> {
        val nativeQuery = entityManager.createNativeQuery(sql)

        parameter.forEachIndexed { index, term ->
            nativeQuery.setParameter(index + 1, term)
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
//            .addScalar("draft")
//            .addScalar("published")
            .addScalar("category")
            .addScalar("wrapperid")
            .addScalar("state")
            .setFirstResult((paging.page - 1) * paging.pageSize)
            .setMaxResults(paging.pageSize)
            .resultList as List<Array<out Any?>>
    }


    private fun getTotalHits(sql: String, termParameters: List<Any>): Int {
        val countSQL = "SELECT count(DISTINCT document_wrapper.id) " + sql
            .substring(sql.indexOf("FROM"))
            .substringBeforeLast("ORDER BY")
        val countQuery = entityManager.createNativeQuery(countSQL)

        termParameters.forEachIndexed { index, term ->
            countQuery.setParameter(index + 1, term)
        }

        return (countQuery.singleResult as Number).toInt()
    }

    private fun filterAndMapResult(
        result: List<Array<out Any?>>,
        isAdmin: Boolean,
        principal: Principal
    ): List<Result> {
        principal as Authentication
        return result
            .filter { item ->
                isAdmin || aclService.getPermissionInfo(
                    principal,
                    item[7] as Int // "id"
                ).canRead
            }.map { item ->
                Result(
                    title = item[1] as? String,
                    _uuid = item[2] as? String,
                    _type = item[3] as? String,
                    _created = item[4] as? Date,
                    _modified = item[5] as? Date,
                    _state = determineDocumentState(item[8] as String),
                    _category = (item[6] as? String),
                    hasWritePermission = if (isAdmin) true else aclService.getPermissionInfo(
                        principal,
                        item[7] as Int
                    ).canWrite,
                    hasOnlySubtreeWritePermission = if (isAdmin) false else aclService.getPermissionInfo(
                        principal,
                        item[7] as Int
                    ).canOnlyWriteSubtree,
                    _id = item[7] as Int
                )
            }
    }

    private fun determineDocumentState(state: String) = DOCUMENT_STATE.valueOf(state).getState()

    fun querySql(
        principal: Principal,
        catalogId: String,
        sqlQuery: String,
        paging: ResearchPaging = ResearchPaging()
    ): ResearchResponse {

        val isAdmin = authUtils.isAdmin(principal)
        var finalQuery = ""
        try {
            assertValidQuery(sqlQuery)
            val catalogQuery = restrictQueryOnCatalog(catalogId, sqlQuery)
            finalQuery = addWrapperIdToQuery(catalogQuery)

            val termAsParameters = emptyList<String>()
            val result = sendQuery(finalQuery, termAsParameters, paging)
            val map = filterAndMapResult(result, isAdmin, principal)

            val totalHits = if (paging.pageSize != Int.MAX_VALUE) {
                getTotalHits(finalQuery, termAsParameters)
            } else {
                map.size
            }

            return ResearchResponse(totalHits, map)
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
