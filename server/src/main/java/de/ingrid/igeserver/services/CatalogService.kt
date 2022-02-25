package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.*
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.*
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.acls.model.AclService
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.util.*

@Service
class CatalogService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val userRepo: UserRepository,
    private val groupRepo: GroupRepository,
    private val roleRepo: RoleRepository,
    private val authUtils: AuthUtils,
    private val aclService: AclService,
    private val keycloakService: UserManagementService,
    private val catalogProfiles: List<CatalogProfile>
) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
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

    fun getUserOfCatalog(catalogId: String): List<UserInfo> {
        return userRepo.findAllByCatalogId(catalogId)
    }

    fun getUser(userId: String): UserInfo? {
        return userRepo.findByUserId(userId)
    }

    fun getCatalogById(id: String): Catalog {

        return catalogRepo.findByIdentifier(id)

    }

    fun setRecentLoginsForUser(user: UserInfo, recentLogins: Array<Date>) {
        user.data?.recentLogins = recentLogins.map { it.time }
        userRepo.save(user)
    }

    fun getAvailableCatalogProfiles(): List<CatalogProfile> {
        return catalogProfiles
    }

    fun getCatalogProfile(id: String): CatalogProfile {
        return catalogProfiles.find { it.identifier == id } ?: throw NotFoundException.withMissingProfile(id)
    }

    fun initializeCatalog(catalogId: String, type: String) {
        initializeCodelists(catalogId, type)
        initializeQueries(catalogId, type)
    }

    fun initializeCodelists(catalogId: String, type: String, codelistId: String? = null) {
        this.getCatalogProfile(type)
            .initCatalogCodelists(catalogId, codelistId)
    }

    fun initializeQueries(catalogId: String, type: String) {
        this.getCatalogProfile(type)
            .initCatalogQueries(catalogId)
    }

    fun getCatalogs(): List<Catalog> {
        return catalogRepo.findAll()
    }

    fun createCatalog(catalog: Catalog): Catalog {
        catalog.identifier = transformNameToIdentifier(catalog.name)

        if (!catalogExists(catalog.identifier)) {
            return catalogRepo.save(catalog)
        }
        return getCatalogById(catalog.identifier)
    }

    private fun transformNameToIdentifier(name: String): String {
        var identifier = name.lowercase().replace(" ".toRegex(), "_")
        // slash not valid as it makes problems in URLs
        identifier = identifier.replace("/".toRegex(), "_")
        return identifier
    }

    fun catalogWithNameExists(name: String): Boolean {
        return catalogExists(transformNameToIdentifier(name))
    }

    fun catalogExists(id: String): Boolean {
        return catalogRepo.existsByIdentifier(id)
    }

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

        // TODO merge existing user who is allready in different catalog
        val user = convertUser(catalogId, userModel)
        user.data?.creationDate = Date()
        user.data?.modificationDate = Date()
        user.catalogs = mutableSetOf(this.getCatalogById(catalogId))
        val createdUser = userRepo.save(user)

        return createdUser

    }

    private fun convertUser(catalogId: String, user: User): UserInfo {
        val dbUser = getUser(user.login) ?: UserInfo()

        return dbUser.apply {
            userId = user.login
            if (data == null) {
                data = UserInfoData(
                    modificationDate = Date()
                )
            }
            data?.organisation = user.organisation
            data?.modificationDate = user.modificationDate

            groups = mergeGroups(catalogId, groups, user)
            role = if (user.role.isNotEmpty()) roleRepo.findByName(user.role) else null
        }
    }

    private fun mergeGroups(
        catalogId: String,
        groups: MutableSet<Group>,
        user: User
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

    fun getPermissions(principal: Authentication): List<String> {
        val isMdAdmin = principal.authorities.any { it.authority == "md-admin" }
        val isCatAdmin = principal.authorities.any { it.authority == "cat-admin" }
        val isSuperAdmin = principal.authorities.any { it.authority == "ige-super-admin" }
        val user = userRepo.findByUserId(authUtils.getUsernameFromPrincipal(principal))

        val permissions = if (isCatAdmin || isSuperAdmin) {
            listOf(
                Permissions.manage_catalog.name,
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
                Permissions.can_create_dataset.name,
                Permissions.can_create_address.name,
            )
        } else if (isMdAdmin) {
            listOf(
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
                Permissions.can_create_dataset.name,
                Permissions.can_create_address.name,
            )
        } else {
            determineNonAdminUserPermissions(principal)
        }

        return if(user != null && user.catalogs.size > 0){
            val catalog = getCatalogById(getCurrentCatalogForPrincipal(principal))
            val catalogProfile = getCatalogProfile(catalog.type)
            catalogProfile.profileSpecificPermissions(permissions, principal)
        } else {
            permissions
        }
    }

    private fun determineNonAdminUserPermissions(principal: Authentication): MutableList<String> {
        // anyone can export
        val userPermissions = mutableListOf(Permissions.can_export.name)

        val userName = authUtils.getUsernameFromPrincipal(principal)
        val userGroups = this.getUser(userName)?.groups
        var can_import = false;
        userGroups?.forEach { group ->
            if (containsAnyWritePermission(group.permissions?.documents)) {
                userPermissions.add(Permissions.can_create_dataset.name)
                can_import = true;
            }
            if (containsAnyWritePermission(group.permissions?.addresses)) {
                userPermissions.add(Permissions.can_create_address.name)
                can_import = true;
            }
        }
        if (can_import) {
            userPermissions.add(Permissions.can_import.name)
        }
        return userPermissions
    }

    private fun containsAnyWritePermission(groupEntries: List<JsonNode>?) =
        groupEntries?.any { entry ->
            entry["isFolder"].asBoolean() && entry["permission"].asText().contains("writeTree")
        } == true

    fun getAllCatalogUsers(principal: Principal): List<User> {
        val catalogId = getCurrentCatalogForPrincipal(principal)

        val keyCloakUsers = keycloakService.getUsersWithIgeRoles(principal)
        val catalogUsers = getUserOfCatalog(catalogId)
        return keyCloakUsers
            .filter { user -> catalogUsers.any { it.userId == user.login } }
            .map { user ->
                val catUser = catalogUsers.find { it.userId == user.login }!!
                applyIgeUserInfo(user, catUser)
            }
    }

    fun applyIgeUserInfo(user: User, igeUser: UserInfo): User {
        user.groups = igeUser.groups.sortedBy { it.name }.map { it.id!! }
        user.creationDate = igeUser.data?.creationDate ?: Date(0)
        user.modificationDate = igeUser.data?.modificationDate ?: Date(0)
        user.role = igeUser.role?.name ?: ""
        user.organisation = igeUser.data?.organisation ?: ""
        return user
    }
}
