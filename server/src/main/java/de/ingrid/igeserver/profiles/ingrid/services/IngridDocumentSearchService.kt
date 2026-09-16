/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 */
package de.ingrid.igeserver.profiles.ingrid.services

import de.ingrid.igeserver.services.ReadableDocumentQueryService
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal

@Service
@Profile("ingrid")
@Transactional(readOnly = true)
class IngridDocumentSearchService(private val readableDocumentQueryService: ReadableDocumentQueryService) {
    /**
     * Checks if a document has a coupled service with GetCapabilities operation.
     * 
     * Searches for documents that have:
     * 1. A coupled resource with the specified UUID in their service.coupledResources array
     * 2. An operation with name.key = '1' (GetCapabilities) in their service.operations array
     * 
     * Only considers documents that the principal has read permission for.
     * 
     * @param catalogId The catalog identifier
     * @param principal The authenticated user
     * @param uuid The UUID of the coupled resource to search for
     * @return true if a matching document exists, false otherwise
     */
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

/**
 * Request data class for checking coupled services.
 * 
 * @property uuid The UUID of the coupled resource to check
 */
data class CoupledServiceSearchRequest(val uuid: String)
