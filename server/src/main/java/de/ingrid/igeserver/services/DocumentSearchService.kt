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
import jakarta.persistence.Tuple
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
    private val authUtils: AuthUtils,
    private val researchService: ResearchService,
    private val readableDocumentQueryService: ReadableDocumentQueryService,
) {
    fun findInTitleOrUuid(
        catalogId: String,
        principal: Principal,
        request: TitleOrUuidSearchRequest,
    ): ResearchResponse {
        require(request.pageSize > 0)
        require(request.category == "data" || request.category == "address")

        // Keep LIKE wildcards and escaping as before; UUID matching remains exact.
        val predicate = """
            (document1.title ILIKE :title OR document1.uuid = :uuid)
            AND document_wrapper.category = :category
            AND 'archived' NOT IN (SELECT UNNEST(document_wrapper.tags))
        """ + if (request.excludeFolders) " AND document1.type != 'FOLDER'" else ""

        return readableDocumentQueryService.withReadableRows(
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
            ResearchResponse(
                totalHits,
                researchService.filterAndMapResult(page, authUtils.isAdmin(principal), principal),
            )
        }
    }
}
