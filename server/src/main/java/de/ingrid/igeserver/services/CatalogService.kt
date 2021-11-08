package de.ingrid.igeserver.services

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
    private val managerRepo: ManagerRepository,
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
        return this.catalogProfiles
            .find { it.identifier == id }!!
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
        setManager(userModel.login, userModel.manager, catalogId)

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
        if (userModel.manager.isNotEmpty()) setManager(userModel.login, userModel.manager, catalogId)
    }

    fun setManager(userId: String, managerId: String, catalogId: String) {
        val catalog = getCatalogById(catalogId)
        val user = userRepo.findByUserId(userId)
        val manager = userRepo.findByUserId(managerId)

        val managerAssignment = managerRepo.findByUser_UserIdAndCatalogIdentifier(userId, catalogId)
        if (managerAssignment != null) {
            managerRepo.delete(managerAssignment)
            managerRepo.flush()
        }
        managerRepo.save(CatalogManagerAssignment().apply {
            id = AssignmentKey().apply {
                this.catalogId = catalog.id as Int
                this.managerId = manager?.id as Int
                this.userId = user?.id as Int
            }
            this.catalog = catalog
            this.user = user
            this.manager = manager
        })
    }

    fun getManagedUserIds(managerId: String, catalogId: String): List<String> {
        return managerRepo.findAllByManager_UserIdAndCatalogIdentifier(managerId, catalogId).map { it.user!!.userId }
    }

    fun getPermissions(principal: Authentication): List<String> {
        val isMdAdmin = principal.authorities.any { it.authority == "md-admin" }
        val isCatAdmin = principal.authorities.any { it.authority == "cat-admin" }
        return if (isCatAdmin) {
            listOf(
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
                Permissions.manage_catalog.name
            )
        } else if (isMdAdmin) {
            listOf(
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
            )
        } else {
            listOf(
                Permissions.can_import.name,
                Permissions.can_export.name,
            )
        }
    }

    fun getAllCatalogUsers(principal: Principal): List<User> {
        val catalogId = getCurrentCatalogForPrincipal(principal)

        val keyCloakUsers = keycloakService.getUsersWithIgeRoles(principal)
        val catalogUsers = getUserOfCatalog(catalogId)
        val filteredUsers = keyCloakUsers
            .filter { user -> catalogUsers.any { it.userId == user.login } }
            .onEach { user ->
                val catUser = catalogUsers.find { it.userId == user.login }!!
                user.groups = catUser.groups.sortedBy { it.name }.map { it.id!! }
                user.creationDate = catUser.data?.creationDate ?: Date(0)
                user.modificationDate = catUser.data?.modificationDate ?: Date(0)
                user.role = catUser.role?.name ?: ""
                user.organisation = catUser.data?.organisation ?: ""
                user.manager = managerRepo.findByUserAndCatalogIdentifier(catUser, catalogId)?.manager?.userId ?: ""
            }
        return filteredUsers
    }


    fun filterUsersForUser(users: Set<User>, userLogin: String): Set<User> {
        val filtered = users.filter { user -> user.manager == userLogin }.toSet()
        if (filtered.isEmpty()) {
            return filtered
        } else {
            val collectedUsers = mutableSetOf<User>()
            collectedUsers.addAll(filtered)
            filtered.forEach { user -> collectedUsers.addAll(filterUsersForUser(users, user.login)) }
            return collectedUsers
        }
    }

}
