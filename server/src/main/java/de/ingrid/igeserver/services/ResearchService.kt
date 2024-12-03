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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.Facets
import de.ingrid.igeserver.model.QuickFilter
import de.ingrid.igeserver.model.ResearchPaging
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.utils.AuthUtils
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import org.apache.logging.log4j.kotlin.logger
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.security.Principal
import java.time.Instant
import java.util.*

data class Result(
    val title: String?,
    @JsonProperty("_id") val id: Int,
    @JsonProperty("_uuid") val uuid: String?,
    @JsonProperty("_type") val type: String?,
    @JsonProperty("_created") val created: Date?,
    @JsonProperty("_contentModified") val contentModified: Date?,
    @JsonProperty("_state") val state: String?,
    @JsonProperty("_category") val category: String?,
    var hasWritePermission: Boolean?,
    var hasOnlySubtreeWritePermission: Boolean?,
    @JsonProperty("_tags") var tags: String?,
    @JsonProperty("_responsibleUser") val responsibleUser: Any?,
    var additional: Any?,
)

@Service
class ResearchService(
    val entityManager: EntityManager,
    val quickFilters: List<QuickFilter>,
    val profiles: List<CatalogProfile>,
    val aclService: IgeAclService,
    val authUtils: AuthUtils,
) {
    val log = logger()
    private final val minimalColumns =
        listOf("uuid", "title", "type", "created", "modified", "contentmodified", "state", "catalog_id", "is_latest")
    val minimalWrapperColumns = listOf("wrapperid", "tags", "responsibleuser", "category", "deleted")
    val minimalColumnsForSQL = minimalColumns.joinToString(",") { "document1.$it" }

    fun createFacetDefinitions(catalogType: String): Facets = profiles
        .find { it.identifier == catalogType }!!
        .let { Facets(it.getFacetDefinitionsForAddresses(), it.getFacetDefinitionsForDocuments()) }

    fun query(
        catalogId: String,
        query: ResearchQuery,
        principal: Principal = SecurityContextHolder.getContext().authentication,
    ): ResearchResponse {
        val groups = authUtils.getCurrentUserRoles(catalogId)
        val hasReadAccessToRootDocs = authUtils.isAdmin(principal) || aclService.hasRootReadAccess(groups)
        val idsToSearchIn = if (hasReadAccessToRootDocs) null else aclService.getDatasetIdsSetInGroups(groups)

        // if a user has no groups then user is not allowed anything
        if (idsToSearchIn.isNullOrEmpty() && !hasReadAccessToRootDocs) {
            return ResearchResponse(0, emptyList())
        }

        val sqlQuery = createQuery(catalogId, query, idsToSearchIn)
        val restricted = restrictQueryOnCatalogAndNotDeleted(catalogId, sqlQuery)
        val sql = addAdditionalSelectsToQuery(restricted)

        val termAsParameters = getParameters(query)
        val result = sendQuery(sql, termAsParameters, query.pagination)
        val map = filterAndMapResult(result, hasReadAccessToRootDocs, principal)

        val totalHits = if (query.pagination.pageSize != Int.MAX_VALUE) {
            getTotalHits(sql, termAsParameters)
        } else {
            map.size
        }

        return ResearchResponse(totalHits, map)
    }

    private fun getParameters(query: ResearchQuery): List<Any> = if (query.term.isNullOrEmpty()) {
        emptyList()
    } else {
        val withWildcard = "%" + query.term + "%"
        // third parameter is for uuid search and so must not contain wildcard
        if (checkForTitleSearch(query.clauses)) {
            listOf(withWildcard)
        } else {
            listOf(withWildcard, withWildcard, query.term)
        }
    }

    private fun createQuery(catalogId: String, query: ResearchQuery, idsToSearchIn: List<Int>?): String = """
            SELECT DISTINCT document1.*
            FROM catalog, document_wrapper Join document document1 on document_wrapper.uuid = document1.uuid
            ${determineJsonSearch(query.term)}
            ${determineWhereQuery(catalogId, query, idsToSearchIn)}
        """ + if (query.orderByField != null) {
        "ORDER BY document1.${query.orderByField} ${query.orderByDirection}"
    } else {
        ""
    }

    /**
     * This method determines the WHERE clause of the SQL query.
     * It is responsible for filtering the search results by catalog, permissions and search term.
     * @param catalogId the catalog identifier
     * @param query the research query
     * @param idsToSearchIn the ids of the documents the user is allowed to see. If null, the user is allowed to see all documents.
     */
    private fun determineWhereQuery(catalogId: String, query: ResearchQuery, idsToSearchIn: List<Int>?): String {
        val catalogFilter = createCatalogFilter(catalogId)
        val groupDocIdsString = idsToSearchIn?.joinToString(",")
        // TODO: uuid IN (SELECT(unnest(dw.path))) might be more performant (https://coderwall.com/p/jmtskw/use-in-instead-of-any-in-postgresql)
        val permissionFilter = if (groupDocIdsString == null) {
            ""
        } else {
            """ AND (document_wrapper.id = ANY(('{$groupDocIdsString}')) 
                    OR ('{$groupDocIdsString}') && document_wrapper.path)
            """.trimIndent()
        }

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
        return if (searchOnlyInTitle) {
            "title ILIKE ?"
        } else {
            "(t.val ILIKE ? OR title ILIKE ? OR document1.uuid ILIKE ?)"
        }
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
                ?.map { it?.isFieldQuery == true } ?: listOf()
        } else {
            listOf(false)
        }

        return filterString.any { it }
    }

    private fun checkForPublishedSearch(clauses: BoolFilter?): Boolean {
        if (clauses == null) {
            return false
        }

        val filterString: List<Boolean> = if (!clauses.clauses.isNullOrEmpty()) {
            clauses.clauses.map { checkForPublishedSearch(it) }
        } else {
            clauses.value
                ?.map { value -> value.replace(" ", "").contains(".state='PUBLISHED'") } ?: listOf()
        }

        return filterString.any { it }
    }

    private fun createCatalogFilter(catalogId: String): String = "document1.catalog_id = catalog.id AND document_wrapper.catalog_id = catalog.id AND catalog.identifier = '$catalogId' "

    private fun determineJsonSearch(term: String?): String = if (!term.isNullOrEmpty()) {
        "LEFT JOIN jsonb_each_text(document1.data) as t(k, val) on true"
    } else {
        ""
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

    private fun sendQuery(sql: String, parameter: List<Any>, paging: ResearchPaging): List<Tuple> {
        val nativeQuery = entityManager.createNativeQuery(sql, Tuple::class.java)

        parameter.forEachIndexed { index, term -> nativeQuery.setParameter(index + 1, term) }

        @Suppress("UNCHECKED_CAST")
        return nativeQuery
            .setFirstResult((paging.page - 1) * paging.pageSize + paging.offset)
            .setMaxResults(paging.pageSize)
            .resultList as List<Tuple>
    }

    private fun getTotalHits(sql: String, termParameters: List<Any>): Int {
        val countSQL = sql.replace("SELECT sql_query.* FROM", "SELECT count(DISTINCT sql_query.wrapperid) FROM")
        val countQuery = entityManager.createNativeQuery(countSQL)

        termParameters.forEachIndexed { index, term ->
            countQuery.setParameter(index + 1, term)
        }

        return (countQuery.singleResult as Number).toInt()
    }

    private fun filterAndMapResult(
        result: List<Tuple>,
        isAdmin: Boolean,
        principal: Principal,
    ): List<Result> {
        val authPrincipal = principal as Authentication
        return result.mapNotNull { item ->
            val itemId = item.get("wrapperid") as? Int ?: return@mapNotNull null
            val permissionInfo = aclService.getPermissionInfo(authPrincipal, itemId)
            if (isAdmin || permissionInfo.canRead) {
                Result(
                    title = item.get("title") as? String,
                    uuid = item.get("uuid") as? String,
                    type = item.get("type") as? String,
                    created = (item.get("created") as? Instant)?.let { Date.from(it) },
                    contentModified = (item.get("contentModified") as? Instant)?.let { Date.from(it) },
                    state = (item.get("state") as? String)?.let { determineDocumentState(it) },
                    category = item.get("category") as? String,
                    hasWritePermission = isAdmin || permissionInfo.canWrite,
                    hasOnlySubtreeWritePermission = !isAdmin && permissionInfo.canOnlyWriteSubtree,
                    id = itemId,
                    tags = (item.get("tags") as? Array<*>)?.joinToString(","),
                    responsibleUser = item.get("responsibleUser"),
                    additional = getAdditionalInfo(item),
                )
            } else {
                null
            }
        }
    }

    private fun getAdditionalInfo(tuple: Tuple): Map<String, Any?> = tuple.elements
        .filter { element -> !minimalColumns.contains(element.alias) && !minimalWrapperColumns.contains(element.alias) }
        .associate { element ->
            element.alias to tuple.get(element.alias)
        }

    private fun determineDocumentState(state: String) = DocumentState.valueOf(state).getState()

    fun querySql(
        principal: Principal,
        catalogId: String,
        sqlQuery: String,
        paging: ResearchPaging = ResearchPaging(),
    ): ResearchResponse {
        val isAdmin = authUtils.isAdmin(principal)
        var finalQuery = ""
        try {
            assertValidQuery(sqlQuery)
            val catalogQuery = restrictQueryOnCatalogAndNotDeleted(catalogId, sqlQuery)
            finalQuery = addAdditionalSelectsToQuery(catalogQuery)

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
                data = mapOf("sql" to finalQuery),
                cause = error,
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

    private fun addAdditionalSelectsToQuery(query: String): String {
        val selectIndex = getSelectIndex(query)
        return """
            ${query.substring(0, selectIndex)}
            document_wrapper.id as wrapperid, document_wrapper.tags as tags, document_wrapper.responsible_user as responsibleUser,document_wrapper.category,document_wrapper.deleted, 
            ${query.substring(selectIndex)}
        """.trimIndent()
    }

    private fun getSelectIndex(query: String): Int {
        val selectDistinctIndex = query.indexOf("SELECT DISTINCT")
        val selectIndex = if (selectDistinctIndex == -1) query.indexOf("SELECT") + 6 else selectDistinctIndex + 15
        return selectIndex
    }

    private fun restrictQueryOnCatalogAndNotDeleted(catalogId: String, sqlQuery: String): String {
        val notDeletedFilter = "deleted = 0"
        val isLatestFilter = "is_latest = true"

        val selectIndex = getSelectIndex(sqlQuery)
        var finalQuery = ""
        if (sqlQuery.contains("document1.*")) {
            finalQuery = sqlQuery.replace("document1.*", minimalColumnsForSQL)
        } else {
            finalQuery = sqlQuery.substring(0, selectIndex) +
                minimalColumnsForSQL + "," +
                sqlQuery.substring(selectIndex + 1)
        }

        return """
            WITH sql_query AS ( $finalQuery )
            SELECT sql_query.* FROM sql_query, catalog
            WHERE sql_query.catalog_id = catalog.id 
                AND catalog.identifier = '$catalogId' 
                AND $notDeletedFilter 
                AND $isLatestFilter
        """.trimIndent()
    }
}
