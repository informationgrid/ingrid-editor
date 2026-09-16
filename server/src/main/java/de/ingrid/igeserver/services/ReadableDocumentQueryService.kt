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

import de.ingrid.igeserver.utils.AuthUtils
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

@Service
@Transactional(readOnly = true)
class ReadableDocumentQueryService(
    private val entityManager: EntityManager,
    private val aclService: IgeAclService,
    private val authUtils: AuthUtils,
    private val researchService: ResearchService,
) {
    /**
     * Executes a query and returns only rows that the principal has read permission for.
     * 
     * This service handles the common pattern of:
     * 1. Building a SQL query with the provided predicate and parameters
     * 2. Executing the query with cursor-based pagination (fetchSize hint)
     * 3. Filtering results based on ACL permissions
     * 4. Processing the filtered results with the provided consumer function
     * 
     * The query joins document_wrapper with document and catalog tables, filtering for
     * non-deleted documents and latest versions only.
     * 
     * @param catalogId The catalog identifier to filter by
     * @param principal The authenticated user
     * @param predicate The SQL predicate to apply (will be inserted into the WHERE clause)
     * @param parameters The query parameters for the predicate
     * @param consume Function to process the filtered result sequence
     * @return The result of the consume function
     */
    fun <T> withReadableRows(
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
