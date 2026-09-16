/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
package de.ingrid.igeserver.profiles.ingrid

import de.ingrid.igeserver.services.ReadableDocumentQueryService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

@Service
@Transactional(readOnly = true)
class IngridDocumentSearchService(private val readableDocumentQueryService: ReadableDocumentQueryService) {
    fun hasCoupledServiceWithGetCapabilities(catalogId: String, principal: Principal, uuid: String): Boolean = readableDocumentQueryService.withReadableRows(
        catalogId,
        principal,
        """
                EXISTS (
                    SELECT 1 FROM jsonb_array_elements(
                        CASE WHEN jsonb_typeof(document1.data->'service'->'coupledResources') = 'array'
                            THEN document1.data->'service'->'coupledResources' ELSE CAST('[]' AS jsonb) END
                    ) AS resource WHERE resource->>'uuid' = :uuid
                )
                AND EXISTS (
                    SELECT 1 FROM jsonb_array_elements(
                        CASE WHEN jsonb_typeof(document1.data->'service'->'operations') = 'array'
                            THEN document1.data->'service'->'operations' ELSE CAST('[]' AS jsonb) END
                    ) AS operation WHERE operation->'name'->>'key' = '1'
                )
            """,
        mapOf("uuid" to uuid),
    ) { it.any() }
}

data class CoupledServiceSearchRequest(val uuid: String)
