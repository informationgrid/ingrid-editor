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
import org.springframework.transaction.annotation.Isolation
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
    private val catalogProfiles: List<CatalogProfile>
) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCurrentCatalogForUser(userId: String): String {

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

    fun initializeCodelists(catalogId: String, type: String, codelistId: String? = null) {
        this.getCatalogProfile(type)
            .initCatalogCodelists(catalogId, codelistId)
    }

    fun getCatalogs(): List<Catalog> {
        return catalogRepo.findAll()
    }

    fun createCatalog(catalog: Catalog): Catalog {
        catalog.identifier = catalog.name.toLowerCase().replace(" ".toRegex(), "_")
        // slash not valid as it makes problems in URLs
        catalog.identifier = catalog.identifier.replace("/".toRegex(), "_")
        if (!catalogExists(catalog.identifier)) {
            return catalogRepo.save(catalog)
        }
        return getCatalogById(catalog.identifier)
    }

    private fun catalogExists(name: String): Boolean {
        return try {
            getCatalogById(name)
            true
        } catch (e: Exception) {
            false
        }
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

    fun deleteUser(userId: String) {

        userRepo.deleteByUserId(userId)

    }

    @Transactional
    fun updateUser(catalogId: String, userModel: User) {

        val user = convertUser(catalogId, userModel)
        userRepo.save(user)
        setManager(userModel.login, userModel.manager, catalogId)
    }

    fun setManager(userId: String, managerId: String, catalogId: String) {
        val catalog = getCatalogById(catalogId)
        val user = userRepo.findByUserId(userId)
        val manager = userRepo.findByUserId(managerId)

        val managerAssignment = managerRepo.findByUser_UserIdAndCatalogIdentifier(userId,catalogId)
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

    fun getPermissions(principal: Authentication): List<String> {
        val isMdAdmin = principal.authorities.any { it.authority == "md-admin" }
        val isCatAdmin = principal.authorities.any { it.authority == "cat-admin" }
        return if (isMdAdmin || isCatAdmin) {
            listOf(
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
                Permissions.manage_catalog.name
            )
        } else {
            listOf(
                Permissions.can_import.name,
                Permissions.can_export.name,
            )
        }
    }

}
