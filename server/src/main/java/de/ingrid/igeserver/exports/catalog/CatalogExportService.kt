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
package de.ingrid.igeserver.exports.catalog

import jakarta.persistence.EntityManager
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import kotlin.collections.first

@Service
class CatalogExportService(
    entityManager: EntityManager,
    transactionManager: PlatformTransactionManager,
) : CatalogTransferService(entityManager, transactionManager) {

    private fun exportCatalogTable(catalogId: Int): MutableMap<String?, Any?> = getQueryResultsAsMap(
        """
        SELECT * FROM catalog WHERE id = '$catalogId';
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

    private fun exportPermissionGroupTable(catalogId: Int): List<MutableMap<String?, Any?>> = getSimpleQueryResultsAsMap(
        "permission_group",
        catalogId,
    )

    private fun exportUserGroupTable(userInfo: List<MutableMap<String?, Any?>>) = getQueryResultsAsMap(
        """
        SELECT * FROM user_group WHERE user_info_id IN (${userInfo.joinToString { it["id"].toString() }});
        """.trimIndent(),
    )

    fun exportCatalog(catalogId: Int): ExportedCatalog {
        val userInfo = exportUserInfoTable(catalogId)

        return ExportedCatalog(
            version = getEditorVersion(),
            catalog = exportCatalogTable(catalogId),
            behaviour = exportBehaviourTable(catalogId),
            codelist = exportCodelistTable(catalogId),
            userInfo = userInfo,
            query = exportQueryTable(catalogId),
            documentWrapper = exportDocumentWrapperTable(catalogId),
            document = exportDocumentTable(catalogId),
            permissionGroup = exportPermissionGroupTable(catalogId),
            userGroup = exportUserGroupTable(userInfo),
        )
    }
}
