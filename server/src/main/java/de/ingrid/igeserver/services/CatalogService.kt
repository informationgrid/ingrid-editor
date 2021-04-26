package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*
import kotlin.collections.HashSet

@Service
class CatalogService @Autowired constructor(
    private val catalogRepo: CatalogRepository,
    private val userRepo: UserRepository,
    private val authUtils: AuthUtils,
    private val catalogProfiles: List<CatalogProfile>
) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal?): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCurrentCatalogForUser(userId: String): String {

        val userData = userRepo.findByUserId(userId)?.data ?: throw NotFoundException.withMissingUserCatalog(userId)

        val currentCatalogId = userData.currentCatalogId

        return when (currentCatalogId != null && currentCatalogId.trim() != "") {
            true -> currentCatalogId
            else -> {
                // ... or first catalog, if existing
                val catalogIds = userData.catalogIds
                if (catalogIds == null || catalogIds.isEmpty()) {
                    throw NotFoundException.withMissingUserCatalog(userId)
                }
                catalogIds[0]
            }
        }
    }

    fun getCatalogsForUser(userId: String): Set<String> {

        val user = userRepo.findByUserId(userId)

        return if (user?.data?.catalogIds?.isEmpty() == true) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            HashSet()
        } else {
            user?.data?.catalogIds?.toSet() ?: HashSet()
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {

        val userData = getUser(userId)?.data

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            mutableListOf()
        } else userData.recentLogins
            ?.map { Date(it) }
            ?.toMutableList() ?: mutableListOf()
    }

    fun getUser(userId: String): UserInfo? {
        return userRepo.findByUserId(userId)
    }

    fun getUserCreationDate(userId: String): Date {
        val user = getUser(userId)
        if (user == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            throw NotFoundException.withMissingUserCatalog(userId)
        }

        return Date(1000 * (user.data?.creationDate?.time ?: 0))
    }

    fun getUserModificationDate(userId: String): Date {
        val user = getUser(userId)
        if (user == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            throw NotFoundException.withMissingUserCatalog(userId)
        }

        return Date(1000 * (user.data?.modificationDate?.time ?: 0))
    }

    fun getGroupsForUser(userId: String, catalogId: String): List<String> {
        val user = getUser(userId)
        if (user == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            throw NotFoundException.withMissingUserCatalog(userId)
        }

        val groupsByCatalog = user.data?.groups
        val groups = groupsByCatalog?.get(catalogId)
        return groups ?: emptyList()
    }

    fun getCatalogById(id: String): Catalog {

        return catalogRepo.findByIdentifier(id)

    }

    fun setCatalogIdsForUser(userId: String, assignedCatalogs: Set<String>?) {
        val user = userRepo.findByUserId(userId)
        user?.data?.catalogIds = assignedCatalogs?.toList() ?: emptyList()
        userRepo.save(user)
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
        if (updatedCatalog.id == null || !catalogExists(updatedCatalog.identifier)) {
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
        val dbUser = try { getUser(user.login) } catch (e: Exception) { UserInfo()}
        return dbUser?.apply {
            userId = user.login
            if (data == null) {
                data = UserInfoData(
                    emptyList(),
                    emptyList(),
                    null,
                    null,
                    null,
                    mutableMapOf()
                )
            }
            data!!.groups?.set(catalogId, user.groups)
        } ?: throw ClientException.withReason("Could not convert user. Does the user exist?")
    }

    fun deleteUser(userId: String) {

        userRepo.deleteByUserId(userId)

    }

    fun updateUser(catalogId: String, userModel: User) {

        val user = convertUser(catalogId, userModel)
        val userFromDB = getUser(user.userId)
        user.id = userFromDB?.id
        user.data?.modificationDate = Date(Message.dateService?.now()?.toEpochSecond() ?: 0)
        user.data?.groups = userFromDB?.data?.groups ?: hashMapOf()
        userRepo.save(user)

    }

    companion object {
        fun toJsonString(map: Any?): String {
            val mapper = ObjectMapper()
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
            return mapper.writeValueAsString(map)
        }
    }
}
