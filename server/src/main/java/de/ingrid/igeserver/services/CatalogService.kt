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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.util.*
import kotlin.jvm.optionals.getOrNull

@Service
class CatalogService(
    private val catalogRepo: CatalogRepository,
    private val userRepo: UserRepository,
    private val groupRepo: GroupRepository,
    private val roleRepo: RoleRepository,
    private val authUtils: AuthUtils,
    private val igeAclService: IgeAclService,
    private val keycloakService: UserManagementService,
    private val catalogProfiles: List<CatalogProfile>,
) {

    private val catalogProfileMap = mutableMapOf<String, CatalogProfile>()

    fun getCurrentCatalogForPrincipal(principal: Principal): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCatalogsForPrincipal(principal: Principal): List<Catalog> {
        if (authUtils.isSuperAdmin(principal)) return this.getCatalogs()

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val user = userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)
        return user.catalogs.toList()
    }

    fun getDbUserFromPrincipal(principal: Principal): UserInfo? {
        principal as Authentication
        val userLogin = authUtils.getUsernameFromPrincipal(principal)
        return getUser(userLogin)
    }

    private fun getCurrentCatalogForUser(userId: String): String {
        val user = userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)

        val currentCatalogId = user.curCatalog?.identifier

        return when (currentCatalogId != null && currentCatalogId.trim().isNotEmpty()) {
            true -> currentCatalogId
            else -> getFirstAssignedCatalog(user)
        }
    }

    private fun getFirstAssignedCatalog(user: UserInfo): String {
        // save first catalog as current catalog
        user.curCatalog = user.catalogs.firstOrNull() ?: throw NotFoundException.withMissingUserCatalog(user.userId)
        userRepo.save(user)

        return user.curCatalog!!.identifier
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {
        val userData = getUser(userId)?.data

        return userData?.recentLogins?.map { Date(it) }?.toMutableList() ?: mutableListOf()
    }

    fun getUserOfCatalog(catalogId: String) = userRepo.findAllByCatalogId(catalogId)

    fun getUser(id: Int): UserInfo? = userRepo.findById(id).getOrNull()

    fun getUser(userId: String): UserInfo? = userRepo.findByUserId(userId)

    fun getAllIgeUserIds(): List<String> = userRepo.getAllUserIds()

    fun getCatalogById(id: String): Catalog = catalogRepo.findByIdentifier(id)

    fun setRecentLoginsForUser(user: UserInfo, recentLogins: Array<Date>) {
        user.data?.recentLogins = recentLogins.map { it.time }
        userRepo.save(user)
    }

    fun getProfileFromCatalog(catalogId: String): CatalogProfile {
        catalogProfileMap[catalogId]?.let { return it }

        val profile = getCatalogById(catalogId).type
        return catalogProfiles.find { it.identifier == profile }
            ?.also { catalogProfileMap[catalogId] = it }
            ?: throw ServerException.withReason("Could not find profile-definition: $profile")
    }

    fun getAvailableCatalogProfiles(): List<CatalogProfile> = catalogProfiles

    fun getCatalogProfile(id: String): CatalogProfile = catalogProfiles.find { it.identifier == id } ?: throw NotFoundException.withMissingProfile(id)

    fun initializeCatalog(catalogId: String, type: String) {
        initializeCodelists(catalogId, type)
        initializeQueries(catalogId, type)
        initializeCatalogConfig(catalogId)
        initializeIndices(type)
    }

    private fun initializeCatalogConfig(catalogId: String) =
        updateCatalogConfig(catalogId, config = CatalogConfig(elasticsearchAlias = catalogId))

    fun initializeCodelists(catalogId: String, type: String, codelistId: String? = null) {
        this.getCatalogProfile(type)
            .initCatalogCodelists(catalogId, codelistId)
    }

    fun initializeQueries(catalogId: String, type: String) = this.getCatalogProfile(type).initCatalogQueries(catalogId)

    fun initializeIndices(type: String) = this.getCatalogProfile(type).initIndices()

    fun getCatalogs(): List<Catalog> = catalogRepo.findAll()

    fun createCatalog(catalog: Catalog): Catalog {
        catalog.identifier = transformNameToIdentifier(catalog.name)

        if (!catalogExists(catalog.identifier)) {
            return catalogRepo.save(catalog)
        }
        return getCatalogById(catalog.identifier)
    }

    private fun transformNameToIdentifier(name: String): String = name.lowercase()
        .replace(" ".toRegex(), "_")
        // slash not valid as it makes problems in URLs
        .replace("/".toRegex(), "_")

    fun catalogWithNameExists(name: String) = catalogExists(transformNameToIdentifier(name))

    fun catalogExists(id: String) = catalogRepo.existsByIdentifier(id)

    fun updateCatalog(updatedCatalog: Catalog) {
        if (!catalogExists(updatedCatalog.identifier)) {
            throw PersistenceException.withReason("Catalog '${updatedCatalog.id}' does not exist.")
        }

        val catalog = getCatalogById(updatedCatalog.identifier)
        catalog.name = updatedCatalog.name
        catalog.description = updatedCatalog.description
        catalogRepo.save(catalog)
    }

    fun removeCatalog(name: String) {
        if (!catalogExists(name)) {
            throw PersistenceException.withReason("Failed to delete non-existing catalog with name '$name'.")
        }

        val catalog = getCatalogById(name)
        catalogRepo.delete(catalog)
    }

    fun createUser(catalogId: String, userModel: User): UserInfo {
        // TODO merge existing user who is already in different catalog
        val user = convertUser(catalogId, userModel)
        user.data?.creationDate = Date()
        user.data?.modificationDate = Date()
        user.catalogs = mutableSetOf(this.getCatalogById(catalogId))

        return userRepo.save(user)
    }

    private fun convertUser(catalogId: String, user: User): UserInfo {
        val dbUser = getUser(user.login) ?: UserInfo()

        return dbUser.apply {
            userId = user.login
            if (data == null) {
                data = UserInfoData(
                    modificationDate = Date(),
                )
            }
            data?.modificationDate = user.modificationDate

            groups = mergeGroups(catalogId, groups, user)
            role = if (user.role.isNotEmpty()) roleRepo.findByName(user.role) else null
        }
    }

    private fun mergeGroups(
        catalogId: String,
        groups: MutableSet<Group>,
        user: User,
    ): HashSet<Group> {
        val groupsFromOtherCatalogs = groups
            .filter { it.catalog?.identifier != catalogId }

        val merge = groupRepo
            .findAllByCatalog_Identifier(catalogId)
            .filter { user.groups.contains(it.id) }
            .toHashSet()

        merge.addAll(groupsFromOtherCatalogs)
        return merge
    }

    fun deleteUser(catalogId: String, userId: String): Boolean {
        val user = userRepo.findByUserId(userId)!!
        user.catalogs = user.catalogs.filter { it.identifier != catalogId }.toMutableSet()

        // only remove user if not connected to any catalog
        if (user.catalogs.size == 0) {
            userRepo.deleteByUserId(userId)
            return true
        } else {
            userRepo.save(user)
            return false
        }
    }

    @Transactional
    fun updateUser(catalogId: String, userModel: User) {
        userModel.modificationDate = Date()
        val user = convertUser(catalogId, userModel)
        userRepo.save(user)
    }

    val catAdminPermisssions = listOf(
        Permissions.manage_messages.name,
        Permissions.manage_catalog.name,
        Permissions.manage_codelist_repository.name,
        Permissions.manage_ibus.name,
        Permissions.manage_users.name,
        Permissions.can_write_root.name,
        Permissions.can_read_root.name,
        Permissions.can_export.name,
        Permissions.can_import.name,
        Permissions.can_create_dataset.name,
        Permissions.can_create_address.name,
    )

    val superAdminPermissions = listOf(
        Permissions.manage_messages.name,
        Permissions.manage_catalog.name,
        Permissions.manage_all_catalogs.name,
        Permissions.manage_codelist_repository.name,
        Permissions.manage_content.name,
        Permissions.manage_ibus.name,
        Permissions.manage_users.name,
        Permissions.can_write_root.name,
        Permissions.can_read_root.name,
        Permissions.can_export.name,
        Permissions.can_import.name,
        Permissions.can_create_dataset.name,
        Permissions.can_create_address.name,
    )

    fun getPermissions(principal: Authentication): List<String> {
        val isMdAdmin = authUtils.containsRole(principal, "md-admin")
        val isCatAdmin = authUtils.containsRole(principal, "cat-admin")
        val isSuperAdmin = authUtils.containsRole(principal, "ige-super-admin")
        val user = userRepo.findByUserId(authUtils.getUsernameFromPrincipal(principal))

        val permissions = if (isSuperAdmin) {
            superAdminPermissions
        } else if (isCatAdmin) {
            catAdminPermisssions
        } else if (isMdAdmin) {
            listOf(Permissions.manage_users.name) + determineNonAdminUserPermissions(principal)
        } else {
            determineNonAdminUserPermissions(principal)
        }

        return if (user != null && user.catalogs.size > 0) {
            getProfileFromCatalog(getCurrentCatalogForPrincipal(principal))
                .profileSpecificPermissions(permissions, principal)
        } else {
            permissions
        }
    }

    private fun determineNonAdminUserPermissions(principal: Authentication): MutableList<String> {
        // anyone can export
        val userPermissions = mutableSetOf(Permissions.can_export.name)

        val userName = authUtils.getUsernameFromPrincipal(principal)
        val catalogIdentifier = getCurrentCatalogForPrincipal(principal)

        this.getUser(userName)
            ?.getGroupsForCatalog(catalogIdentifier)
            ?.forEach { group -> userPermissions += getPermissionsFromGroup(group) }
        return userPermissions.toMutableList()
    }

    private fun getPermissionsFromGroup(
        group: Group,
    ): MutableSet<String> {
        val userPermissions = mutableSetOf<String>()
        if (group.permissions?.rootPermission == RootPermissionType.WRITE) {
            userPermissions.add(Permissions.can_write_root.name)
            userPermissions.add(Permissions.can_create_dataset.name)
            userPermissions.add(Permissions.can_create_address.name)
            userPermissions.add(Permissions.can_import.name)
        } else {
            if (group.permissions?.rootPermission == RootPermissionType.READ) userPermissions.add(Permissions.can_read_root.name)

            if (containsAnyFolderWritePermission(group.permissions?.documents ?: emptyList())) {
                userPermissions.add(Permissions.can_create_dataset.name)
                userPermissions.add(Permissions.can_import.name)
            }
            if (containsAnyFolderWritePermission(group.permissions?.addresses ?: emptyList())) {
                userPermissions.add(Permissions.can_create_address.name)
                userPermissions.add(Permissions.can_import.name)
            }
        }
        return userPermissions
    }

    private fun containsAnyFolderWritePermission(groupEntries: List<JsonNode>) =
        groupEntries.any { entry ->

            val isFolder = entry["isFolder"]?.asBoolean() ?: false
            val hasAnyWritePermission =
                listOf("writeTree", "writeTreeExceptParent").contains(entry["permission"]?.asText())

            isFolder && hasAnyWritePermission
        }

    /**
     *  get all users of active catalog
     */
    fun getAllCatalogUsers(principal: Principal): List<User> {
        val catalogId = getCurrentCatalogForPrincipal(principal)
        return getAllCatalogUsers(catalogId)
    }

    fun getAllCatalogUsers(catalogId: String): List<User> {
        val keyCloakUsers = keycloakService.getUsersWithIgeRoles()
        val catalogUsers = getUserOfCatalog(catalogId)
        return keyCloakUsers
            .filter { user -> catalogUsers.any { it.userId == user.login } }
            .map { user ->
                val catUser = catalogUsers.find { it.userId == user.login }!!
                applyIgeUserInfo(user, catUser, catalogId)
            }
    }

    private fun getAllCatalogUsernames(principal: Principal): List<String> {
        val catalogId = getCurrentCatalogForPrincipal(principal)
        return userRepo.findAllUserIdsByCatalogId(catalogId)
    }

    fun getEditableUsernamesForCurrentCatalog(principal: Principal): List<String> =
        filterEditableUsers(principal, getAllCatalogUsernames(principal))

    /**
     * Check if the principal can edit the user
     *
     * To check more than one user use filterEditableUsers
     * for better performance
     *
     * @param principal the principal
     * @param username the username to check
     * @return true if the principal can edit the user
     */
    fun canEditUser(principal: Principal, username: String) =
        filterEditableUsers(principal, listOf(username)).isNotEmpty()

    /**
     * Filter users that are editable by the principal
     * @param principal the principal
     * @param usernames list of usernames ids to check
     * @return list of usernames that are editable by the principal
     */
    fun filterEditableUsers(principal: Principal, usernames: List<String>): List<String> {
        // admins have access to every user
        if (authUtils.isAdmin(principal)) return usernames
        val groupAccessCache = mutableMapOf<Int, Boolean>()

        return usernames.filter { username ->
            val requestedUser = userRepo.findByUserId(username)
            // meta admins don't have access to superadmins and katadmins
            if (listOf("ige-super-admin", "cat-admin").contains(requestedUser?.role?.name)) return@filter false

            // check principal has rights for all groups of the requested user (in the active catalog) or the user has no groups
            val catalogId = getCurrentCatalogForPrincipal(principal)
            requestedUser?.groups?.filter { it.catalog?.identifier == catalogId }
                ?.all { group ->
                    groupAccessCache.getOrPut(group.id!!) {
                        hasRightsForGroup(principal, group)
                    }
                } ?: true
        }
    }

    fun hasRightsForGroup(
        principal: Principal,
        group: Group,
    ) = igeAclService.hasRightsForGroup(
        principal as Authentication,
        group,
    )

    fun applyIgeUserInfo(user: User, igeUser: UserInfo, catalogId: String): User {
        user.id = igeUser.id
        user.groups = igeUser.getGroupsForCatalog(catalogId).sortedBy { it.name }.map { it.id!! }
        user.creationDate = igeUser.data?.creationDate ?: Date(0)
        user.modificationDate = igeUser.data?.modificationDate ?: Date(0)
        user.role = igeUser.role?.name ?: ""
        // if not already set with keycloak check in legacy field of UserInfoData
        @Suppress("DEPRECATION")
        user.organisation = if (user.organisation != "") user.organisation else igeUser.data?.organisation ?: ""
        return user
    }

    fun updateCatalogConfig(
        identifier: String,
        name: String? = null,
        description: String? = null,
        config: CatalogConfig,
    ) {
        val catalog = catalogRepo.findByIdentifier(identifier)
        catalog.apply {
            if (name != null) this.name = name
            if (description != null) this.description = description
            settings.config = config
        }
        catalogRepo.save(catalog)
    }
}
