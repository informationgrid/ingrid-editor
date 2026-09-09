/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.model.ResearchResponse
import de.ingrid.igeserver.model.TitleOrUuidSearchRequest
import de.ingrid.igeserver.utils.AuthUtils
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

/**
 * Application searches use server-owned predicates and bound values.
 * Raw SQL supplied by clients belongs exclusively to the SQL research API.
 */
@Service
@Transactional(readOnly = true)
class DocumentSearchService(
    private val entityManager: EntityManager,
    private val aclService: IgeAclService,
    private val authUtils: AuthUtils,
    private val researchService: ResearchService,
) {
    fun findInTitleOrUuid(catalogId: String, principal: Principal, request: TitleOrUuidSearchRequest): ResearchResponse {
        require(request.pageSize > 0)
        require(request.category == "data" || request.category == "address")

        // Keep LIKE wildcards and escaping as before; UUID matching remains exact.
        val predicate = """
            (document1.title ILIKE :title OR document1.uuid = :uuid)
            AND document_wrapper.category = :category
            AND 'archived' NOT IN (SELECT UNNEST(document_wrapper.tags))
        """ + if (request.excludeFolders) " AND document1.type != 'FOLDER'" else ""

        return withReadableRows(
            catalogId,
            principal,
            predicate,
            mapOf("title" to "%${request.term}%", "uuid" to request.term, "category" to request.category),
        ) { rows ->
            val page = mutableListOf<Tuple>()
            var totalHits = 0
            rows.forEach {
                totalHits++
                if (page.size < request.pageSize) page.add(it)
            }
            ResearchResponse(totalHits, researchService.filterAndMapResult(page, authUtils.isAdmin(principal), principal))
        }
    }

    fun hasCoupledServiceWithGetCapabilities(catalogId: String, principal: Principal, uuid: String): Boolean = withReadableRows(
        catalogId,
        principal,
        """
            EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                    CASE WHEN jsonb_typeof(document1.data->'service'->'coupledResources') = 'array'
                        THEN document1.data->'service'->'coupledResources' ELSE CAST('[]' AS jsonb) END
                ) AS resource
                WHERE resource->>'uuid' = :uuid
            )
            AND EXISTS (
                SELECT 1
                FROM jsonb_array_elements(
                    CASE WHEN jsonb_typeof(document1.data->'service'->'operations') = 'array'
                        THEN document1.data->'service'->'operations' ELSE CAST('[]' AS jsonb) END
                ) AS operation
                WHERE operation->'name'->>'key' = '1'
            )
        """,
        mapOf("uuid" to uuid),
    ) { it.any() }

    fun getHmbtgDocumentTitles(catalogId: String, principal: Principal, uuids: List<String>): List<String> {
        if (uuids.isEmpty()) return emptyList()
        return withReadableRows(
            catalogId,
            principal,
            "document1.uuid IN (:uuids) AND document1.data->'properties'->>'publicationHmbTG' = 'true'",
            mapOf("uuids" to uuids.distinct()),
        ) { rows -> rows.map { it.get("title") as String }.toList() }
    }

    private fun <T> withReadableRows(
        catalogId: String,
        principal: Principal,
        predicate: String,
        parameters: Map<String, Any>,
        consume: (Sequence<Tuple>) -> T,
    ): T {
        val sql = """
            SELECT ${researchService.minimalColumnsForSQL},
                document_wrapper.id AS wrapperid, document_wrapper.tags,
                document_wrapper.responsible_user AS responsibleUser, document_wrapper.category,
                document_wrapper.deleted, document_wrapper.catalog_id AS wrapper_catalog_id
            FROM document_wrapper
            JOIN document document1
                ON document_wrapper.uuid = document1.uuid
                AND document_wrapper.catalog_id = document1.catalog_id
            JOIN catalog ON document_wrapper.catalog_id = catalog.id
            WHERE catalog.identifier = :catalogId
                AND document_wrapper.deleted = 0 AND document1.is_latest = true
                AND ($predicate)
            ORDER BY document1.title, document1.uuid
        """
        val query = entityManager.createNativeQuery(sql, Tuple::class.java)
        query.setParameter("catalogId", catalogId)
        parameters.forEach { (name, value) -> query.setParameter(name, value) }
        // A cursor keeps broad searches bounded in memory while ACL checks precede counting/paging.
        query.setHint("org.hibernate.fetchSize", 100)
        val isAdmin = authUtils.isAdmin(principal)
        val authentication = principal as Authentication
        return query.resultStream.use { stream ->
            val readable = stream.iterator().asSequence().map { it as Tuple }.filter {
                isAdmin || aclService.getPermissionInfo(authentication, it.get("wrapperid") as Int).canRead
            }
            consume(readable)
        }
    }
}
