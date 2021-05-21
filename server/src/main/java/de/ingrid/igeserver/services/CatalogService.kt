package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.*
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.acls.domain.*
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.MutableAcl
import org.springframework.security.acls.model.Permission
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

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            mutableListOf()
        } else userData.recentLogins
            .map { Date(it) }
            .toMutableList()
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

    fun isSuperAdmin(roles: Set<String>?): Boolean {
        return roles?.contains("admin") ?: false
    }

    fun getAvailableCatalogs(): List<CatalogProfile> {
        return catalogProfiles
    }

    fun initializeCodelists(catalogId: String, type: String, codelistId: String? = null) {
        this.catalogProfiles
            .find { it.identifier == type }
            ?.initCatalogCodelists(catalogId, codelistId)
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

    fun createUser(catalogId: String, userModel: User) {

        val user = convertUser(catalogId, userModel)
        val userFromDB = getUser(user.userId)
        user.id = userFromDB?.id
        user.data?.creationDate = Date(Message.dateService?.now()?.toEpochSecond() ?: 0)
        user.data?.modificationDate = Date(Message.dateService?.now()?.toEpochSecond() ?: 0)
        userRepo.save(user)

    }

    private fun convertUser(catalogId: String, user: User): UserInfo {
        val dbUser = getUser(user.login) ?: UserInfo()

        return dbUser.apply {
            userId = user.login
            if (data == null) {
                data = UserInfoData(
                    modificationDate = Date(Message.dateService?.now()?.toEpochSecond() ?: 0)
                )
            }

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

//        val userFromDB = getUser(userModel.login) ?: throw NotFoundException.withMissingUserCatalog(userModel.login)
        val user = convertUser(catalogId, userModel)
//        user.id = userFromDB.id

//        updateAcl(user.groups)

        userRepo.save(user)

    }

    /*private fun updateAcl(groups: MutableSet<Group>) {

        aclService as JdbcMutableAclService
        
        groups.forEach { group ->
            group.data?.documents?.forEach {
                val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
                val acl: MutableAcl = try {
                    aclService.readAclById(objIdentity) as MutableAcl
                } catch (ex: org.springframework.security.acls.model.NotFoundException) {
                    aclService.createAcl(objIdentity)
                }

                val sid = GrantedAuthoritySid("GROUP_${group.name}")

                addACEs(acl, it, sid)
                aclService.updateAcl(acl)
            }
        }


    }

    private fun addACEs(acl: MutableAcl, docPermission: JsonNode, sid: GrantedAuthoritySid) {
        // write complete new acl entries for this object 
        // removeEntries(acl)
        
        determinePermission(docPermission)
            .forEach {
                acl.insertAce(acl.entries.size, it, sid, true)
            }
    }

    private fun removeEntries(acl: MutableAcl) {
        // remove always the first element until empty
        while(acl.entries.isNotEmpty()) { acl.deleteAce(0) }
    }

    private fun determinePermission(docPermission: JsonNode): List<Permission> {
        return when (docPermission.get("permission").asText()) {
            "writeSubTree" -> listOf(BasePermission.READ, BasePermission.WRITE)
            "writeDataset" -> listOf(BasePermission.READ, BasePermission.WRITE)
            else -> listOf(BasePermission.READ)
        }
    }*/

    fun getPermissions(principal: Authentication): List<String> {
        val isMdAdmin = principal.authorities.any { it.authority == "md-admin"}
        val isCatAdmin = principal.authorities.any { it.authority == "cat-admin"}
        return if (isMdAdmin || isCatAdmin) {
            listOf(
                Permissions.manage_users.name,
                Permissions.can_export.name,
                Permissions.can_import.name,
                Permissions.manage_catalog.name
            )
        } else {
            listOf()
        }
    }

}
