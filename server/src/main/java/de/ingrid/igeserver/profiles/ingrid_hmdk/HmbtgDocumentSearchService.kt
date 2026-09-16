/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
package de.ingrid.igeserver.profiles.ingrid_hmdk

import de.ingrid.igeserver.services.ReadableDocumentQueryService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

@Service
@Transactional(readOnly = true)
class HmbtgDocumentSearchService(private val readableDocumentQueryService: ReadableDocumentQueryService) {
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

data class HmbtgDocumentTitlesRequest(val uuids: List<String>)
