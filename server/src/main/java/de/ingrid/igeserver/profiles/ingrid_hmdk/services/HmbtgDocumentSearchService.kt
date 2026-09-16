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
package de.ingrid.igeserver.profiles.ingrid_hmdk.services

import de.ingrid.igeserver.services.ReadableDocumentQueryService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

@Service
@Profile("ingrid-hmdk")
@Transactional(readOnly = true)
class HmbtgDocumentSearchService(private val readableDocumentQueryService: ReadableDocumentQueryService) {
    /**
     * Retrieves document titles for the given UUIDs where publicationHmbTG is true.
     * 
     * Only returns documents that the principal has read permission for.
     * The query filters by UUID list and the publicationHmbTG property in the document's properties.
     * 
     * @param catalogId The catalog identifier
     * @param principal The authenticated user
     * @param uuids List of document UUIDs to search for
     * @return List of document titles for matching documents
     */
    fun getDocumentTitles(catalogId: String, principal: Principal, uuids: List<String>): List<String> {
        if (uuids.isEmpty()) return emptyList()
        return readableDocumentQueryService.withReadableRows(
            catalogId,
            principal,
            "document1.uuid IN (:uuids) AND document1.data->'properties'->>'publicationHmbTG' = 'true'",
            mapOf("uuids" to uuids.distinct()),
        ) { rows -> rows.map { it.get("title") as String }.toList() }
    }
}

/**
 * Request data class for retrieving HMB-TG document titles.
 * 
 * @property uuids List of document UUIDs to retrieve titles for
 */
data class HmbtgDocumentTitlesRequest(val uuids: List<String>)
