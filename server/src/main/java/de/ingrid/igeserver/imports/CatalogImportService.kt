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
package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.catalog.CatalogTransferService
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.model.meta.PermissionsData
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import kotlin.collections.associate
import kotlin.collections.first
import kotlin.collections.forEach
import kotlin.collections.joinToString

@Service
class CatalogImportService(
    entityManager: EntityManager,
    transactionManager: PlatformTransactionManager,
    val groupService: GroupService,
    val catalogService: CatalogService,
) : CatalogTransferService(entityManager, transactionManager) {
    private val log = logger()

    fun importCatalog(exportedCatalog: ExportedCatalog) {
        runPreChecks(exportedCatalog)

        val catalogId = createCatalog(exportedCatalog.catalog)

        importBehaviours(exportedCatalog.behaviour, catalogId)
        importCodelists(exportedCatalog.codelist, catalogId)

        val userMigrationMap = importUserInfo(exportedCatalog.userInfo, catalogId)
        addCatalogUserInfo(catalogId, userMigrationMap.values)
        // TODO: import new users to keycloak

        importQueries(exportedCatalog.query, catalogId, userMigrationMap)

        val documentWrapperMigrationMap = importDocumentWrapper(exportedCatalog.documentWrapper, catalogId, userMigrationMap)
        createObjectIdentities(documentWrapperMigrationMap.values.toList())

        importDocuments(exportedCatalog.document, catalogId, userMigrationMap)

        val groupMigrationMap = importGroups(exportedCatalog.permissionGroup, catalogId, documentWrapperMigrationMap, userMigrationMap)
        assignGroupsToUsers(exportedCatalog.userGroup, groupMigrationMap, userMigrationMap)

        saveAllGroupsOfCatalog(exportedCatalog.catalog["identifier"] as String)
    }

    private fun runPreChecks(exportedCatalog: ExportedCatalog) {
        val currentVersion = getEditorVersion()
        if (exportedCatalog.version != currentVersion) {
            throw ServerException.withReason("The editor version of the exported catalog is different from the current version: ${exportedCatalog.version} != $currentVersion")
        }

        if (catalogService.catalogExists(exportedCatalog.catalog["identifier"] as String)) {
            throw ServerException.withReason("The catalog with identifier ${exportedCatalog.catalog["identifier"]} already exists")
        }
    }

    private fun addCatalogUserInfo(catalogId: Int, userInfoIds: Collection<Int>) = importToTable(
        "catalog_user_info",
        userInfoIds.map { userInfoId ->
            mapOf(
                "catalog_id" to catalogId,
                "user_info_id" to userInfoId,
            )
        },
    )

    private fun importBehaviours(behaviours: List<MutableMap<String?, Any?>>, catalogId: Int) {
        behaviours.forEach { row ->
            row.remove("id")
            row["catalog_id"] = catalogId
        }
        importToTable("behaviour", behaviours)
    }

    private fun importCodelists(codelists: List<MutableMap<String?, Any?>>, catalogId: Int) {
        codelists.forEach { row ->
            row.remove("id")
            row["catalog_id"] = catalogId
        }
        importToTable("codelist", codelists)
    }

    private fun importUserInfo(userInfo: List<MutableMap<String?, Any?>>, catalogId: Int): Map<Int, Int> {
        val idMigrationMap = mutableMapOf<Int, Int>()
        val exportedUserIds = mutableMapOf<String, Int>()
        val currentUserIds: Map<String, Int> = getCurrentUsers()

        var newUserData = mutableListOf<MutableMap<String?, Any?>>()
        userInfo.forEach { row ->
            val username = row["user_id"] as String
            val exportedId = row["id"] as Int
            exportedUserIds[username] = exportedId

            if (currentUserIds.contains(username)) {
                // map the exported user id to the current user id
                idMigrationMap[exportedId] = currentUserIds[username]!!
            } else {
                // new user that needs to be created
                newUserData += row
            }
        }

        val createdUsers = importNewUsers(catalogId, newUserData)
        // map the exported user ids to the new user ids
        createdUsers.forEach { (username, id) -> idMigrationMap.plus(exportedUserIds[username]!! to id) }

        return idMigrationMap
    }

    private fun importQueries(queries: List<MutableMap<String?, Any?>>, catalogId: Int, userInfoMigrationMap: Map<Int, Int>) {
        queries.forEach { row ->
            row.remove("id")
            row["catalog_id"] = catalogId
            if (row["user_id"] != null) row["user_id"] = userInfoMigrationMap[row["user_id"] as Int]
        }
        importToTable("query", queries)
    }

    private fun importDocumentWrapper(
        documentWrapper: List<MutableMap<String?, Any?>>,
        catalogId: Int,
        userMigrationMap: Map<Int, Int>,
    ): Map<Int, Int> {
        val wrapperIdMigrationMap = mutableMapOf<Int, Int>()

        @Suppress("UNCHECKED_CAST")
        val depthToWrapper = documentWrapper.groupBy { (it["path"] as List<String>).size }

        depthToWrapper.keys.sorted().forEach { depth ->
            log.info("Importing DocumentWrapper with depth $depth ...")
            wrapperIdMigrationMap.putAll(importIntoDocumentWrapperTable(catalogId, depthToWrapper[depth]!!, wrapperIdMigrationMap, userMigrationMap))
        }

        return wrapperIdMigrationMap
    }

    private fun createObjectIdentities(wrapperIds: List<Int>) {
        @Suppress("UNCHECKED_CAST")
        val objectIdentityData = wrapperIds.map { wrapperId ->
            mapOf(
                "object_id_class" to 1,
                "object_id_identity" to wrapperId,
                "parent_object" to null,
                "owner_sid" to 1,
                "entries_inheriting" to true,
            )
        } as List<Map<String?, Any?>>
        importToTable("acl_object_identity", objectIdentityData)
    }

    private fun importDocuments(document: List<MutableMap<String?, Any?>>, catalogId: Int, userMigrationMap: Map<Int, Int>) {
        document.forEach { row ->
            row.remove("id")
            row["catalog_id"] = catalogId
            if (row["createdbyuser"] != null) row["createdbyuser"] = userMigrationMap[row["createdbyuser"] as Int]
            if (row["modifiedbyuser"] != null) row["modifiedbyuser"] = userMigrationMap[row["modifiedbyuser"] as Int]
        }
        importToTable("document", document)
    }

    private fun importIntoDocumentWrapperTable(
        catalogId: Int,
        wrapper: List<MutableMap<String?, Any?>>,
        idMigrationMap: Map<Int, Int>,
        userMigrationMap: Map<Int, Int>,
    ): Map<Int, Int> {
        if (wrapper.isEmpty()) {
            log.warn("No DocumentWrapper to import!")
            return emptyMap()
        }
        val previousIds = mutableListOf<Int>()
        wrapper.forEach { row ->
            previousIds += row.remove("id") as Int
            row["catalog_id"] = catalogId

            // non-root nodes: map parent_id and path to the new ids
            if (row["parent_id"] != null) {
                row["parent_id"] = idMigrationMap[row["parent_id"] as Int]
                @Suppress("UNCHECKED_CAST")
                row["path"] = "{${(row["path"] as List<String>).joinToString(",") { idMigrationMap[it.toInt()].toString() }}}"
            }

            if (row["tags"] != null) {
                @Suppress("UNCHECKED_CAST")
                row["tags"] = "{${(row["tags"] as List<String>).joinToString(",")}}"
            }

            if (row["responsible_user"] != null) {
                row["responsible_user"] = userMigrationMap[row["responsible_user"] as Int]
            }
        }
        val newIds = importToTableReturningId("document_wrapper", wrapper)
        return previousIds.zip(newIds).toMap()
    }

    private fun importGroups(
        permissionGroups: List<MutableMap<String?, Any?>>,
        catalogId: Int,
        documentWrapperMigrationMap: Map<Int, Int>,
        userMigrationMap: Map<Int, Int>,
    ): Map<Int, Int> {
        val previousIds = mutableListOf<Int>()
        permissionGroups.forEach { row ->
            previousIds += row.remove("id") as Int
            row["catalog_id"] = catalogId
            if (row["manager_id"] != null) row["manager_id"] = userMigrationMap[row["manager_id"] as Int]

            row["permissions"] = adaptGroupPermissions(row["permissions"] as String, documentWrapperMigrationMap)
        }
        if (permissionGroups.isEmpty()) {
            log.warn("No PermissionGroups to import!")
            return emptyMap()
        }

        val newIds = importToTableReturningId("permission_group", permissionGroups)
        return previousIds.zip(newIds).toMap()
    }

    private fun importToTableReturningId(tableName: String, data: List<Map<String?, Any?>>): List<Int> {
        if (data.isEmpty()) {
            log.warn("No data to import to table $tableName")
            return emptyList()
        }
        val query = entityManager.createNativeQuery(
            """
            INSERT INTO $tableName (${data.first().keys.joinToString()}) VALUES ${generatePlaceholder(data)}
            RETURNING id;
            """.trimIndent(),
            Tuple::class.java,
        )
        populateParameters(query, data)
        return getQueryResultsAsMap(query).map { row -> row["id"] as Int }
    }

    private fun adaptGroupPermissions(permissions: String, documentWrapperMigrationMap: Map<Int, Int>): String {
        val permissions = jacksonObjectMapper().readValue(permissions, PermissionsData::class.java)
        val idMigrationMap = documentWrapperMigrationMap
        return PermissionsData(
            permissions.rootPermission,
            updatePermission(permissions.documents, idMigrationMap),
            updatePermission(permissions.addresses, idMigrationMap),
        )
            .let { jacksonObjectMapper().writeValueAsString(it) }
    }

    private fun updatePermission(permissions: List<JsonNode>?, idMigrationMap: Map<Int, Int>) = permissions?.map { permission ->
        permission as ObjectNode
        val oldId = permission.get("id").asInt()
        permission.put("id", idMigrationMap[oldId])
    }

    private fun saveAllGroupsOfCatalog(catalogIdentifier: String) {
        groupService
            .getAll(catalogIdentifier)
            .forEach { group ->
                groupService.update(catalogIdentifier, group.id!!, group, true)
            }
    }

    private fun assignGroupsToUsers(
        userGroups: List<MutableMap<String?, Any?>>,
        groupMigrationMap: Map<Int, Int>,
        userMigrationMap: Map<Int, Int>,
    ) {
        userGroups.forEach { row ->
            row["user_info_id"] = userMigrationMap[row["user_info_id"] as Int]
            row["group_id"] = groupMigrationMap[row["group_id"] as Int]
        }
        importToTable("user_group", userGroups)
    }

    /**
     * Get all users from the user_info table
     *
     * @return a map where the key is the user_id and the value is the id
     * of the user
     */
    private fun getCurrentUsers(): Map<String, Int> = getQueryResultsAsMap(
        """
                SELECT id, user_id FROM user_info;
        """.trimIndent(),
    ).associate { row -> row["user_id"] as String to row["id"] as Int }

    private fun createCatalog(data: MutableMap<String?, Any?>): Int {
        data.remove("id")
        return importToTableReturningId("catalog", listOf(data)).first()
    }

    private fun importNewUsers(newCatalogId: Int, newUserdata: List<MutableMap<String?, Any?>>): Map<String, Int> {
        if (newUserdata.isEmpty()) {
            log.warn("No new users to import")
            return emptyMap()
        }
        newUserdata.forEach { row ->
            {
                row.remove("id")
                row["cur_catalog_id"] = newCatalogId
            }
        }

        ClosableTransaction(transactionManager).use {
            val query = entityManager.createNativeQuery(
                """
                INSERT INTO user_info (${newUserdata.first().keys.joinToString()}) VALUES ${generatePlaceholder(newUserdata)}
                RETURNING id, user_id;
                """.trimIndent(),
                Tuple::class.java,
            )
            populateParameters(query, newUserdata)
            return getQueryResultsAsMap(query).associate { row -> row["user_id"] as String to row["id"] as Int }
        }
    }
}
