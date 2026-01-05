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
package de.ingrid.igeserver.exports.catalog

import de.ingrid.igeserver.api.ExportCatalogOptions
import de.ingrid.igeserver.services.CatalogService
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class CatalogExportService(
    entityManager: EntityManager,
    transactionManager: PlatformTransactionManager,
    val catalogService: CatalogService,
) : CatalogTransferService(entityManager, transactionManager) {

    private fun exportCatalogTable(catalogIdentifier: String): MutableMap<String?, Any?> = getQueryResultsAsMap(
        """
        SELECT * FROM catalog WHERE identifier = '$catalogIdentifier';
        """.trimIndent(),
    ).first()

    private fun exportBehaviourTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "behaviour",
        catalogId,
    )
    private fun exportCodelistTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "codelist",
        catalogId,
    )

    private fun exportUserInfoTable(catalogId: Int): List<MutableMap<String?, Any?>> = getQueryResultsAsMap(
        """
        SELECT u.* FROM user_info u, catalog_user_info cu WHERE cu.user_info_id = u.id AND cu.catalog_id = $catalogId;
        """.trimIndent(),
    )

    private fun exportQueryTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "query",
        catalogId,
    )

    private fun exportDocumentWrapperTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "document_wrapper",
        catalogId,
    )

    private fun exportDocumentTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "document",
        catalogId,
    )

    private fun exportDocumentTableForNonArchivedWrappers(catalogId: Int): List<MutableMap<String?, Any?>> = getQueryResultsAsMap(
        """
        SELECT * FROM document 
        WHERE catalog_id = $catalogId 
        AND state != 'ARCHIVED'
        """.trimIndent(),
    )

    private fun exportPermissionGroupTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "permission_group",
        catalogId,
    )

    private fun exportUserGroupTable(
        userInfo: List<MutableMap<String?, Any?>>,
        permissionGroup: List<MutableMap<String?, Any?>>,
    ) = if (permissionGroup.isEmpty() || userInfo.isEmpty()) {
        emptyList()
    } else {
        getQueryResultsAsMap(
            """
        SELECT * FROM user_group 
        WHERE user_info_id IN (${userInfo.joinToString { it["id"].toString() }})
        AND group_id in (${permissionGroup.joinToString { it["id"].toString() }});
            """.trimIndent(),
        )
    }

    private fun exportUsers(catalogIdentifier: String) = catalogService.getAllCatalogUsers(catalogIdentifier)

    fun exportCatalog(catalogIdentifier: String, options: ExportCatalogOptions = ExportCatalogOptions()): ExportedCatalog {
        val catalog = exportCatalogTable(catalogIdentifier)
        val catalogId = catalog["id"] as Int
        val includeUsers = options.exportUsers
        val includeArchived = options.exportArchivedDatasets

        val userInfo = if (includeUsers) exportUserInfoTable(catalogId) else emptyList()
        val permissionGroup = if (includeUsers) exportPermissionGroupTable(catalogId) else emptyList()

        return ExportedCatalog(
            version = getEditorVersion(),
            catalog = catalog,
            behaviour = exportBehaviourTable(catalogId),
            codelist = exportCodelistTable(catalogId),
            userInfo = userInfo,
            query = exportQueryTable(catalogId),
            documentWrapper = exportDocumentWrapperTable(catalogId),
            document = if (includeArchived) exportDocumentTable(catalogId) else exportDocumentTableForNonArchivedWrappers(catalogId),
            permissionGroup = permissionGroup,
            userGroup = if (includeUsers) exportUserGroupTable(userInfo, permissionGroup) else emptyList(),
            users = if (includeUsers) exportUsers(catalogIdentifier) else emptyList(),
        )
    }
}
