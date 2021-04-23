package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

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

        val userData = userRepo.findByUserId(userId).data ?: throw NotFoundException.withMissingUserCatalog(userId)

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

        return if (user.getCatalogIds().isEmpty()) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            HashSet()
        } else {
            user.getCatalogIds().toSet()
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {

        val userData = userRepo.findByUserId(userId).data

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            mutableListOf()
        } else userData.recentLogins
            ?.map { Date(it) }
            ?.toMutableList() ?: mutableListOf()
    }

    fun getUserCreationDate(userId: String): Date {
        dbService.acquireDatabase().use {
            val user = getUser(userId)
            if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            return Date(1000 * (user["creationDate"]?.asLong() ?: 0))
        }
    }

    fun getUserModificationDate(userId: String): Date {
        dbService.acquireDatabase().use {
            val user = getUser(userId)
            if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            return Date(1000 * (user["modificationDate"]?.asLong() ?: 0))
        }
    }

    fun getGroupsForUser(userId: String): List<String> {
        dbService.acquireDatabase().use {
            val user = getUser(userId)
            if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            val groupsByCatalog = user["groups"]
            val groups = groupsByCatalog?.get(dbService.currentCatalog) as ArrayNode?
            return groups?.mapNotNull { it.asText() } ?: emptyList()
        }
    }

    fun getAllGroupsForUser(userId: String): HashMap<String, List<String>> {
        dbService.acquireDatabase().use {
            val user = getUser(userId)
            if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            val map = hashMapOf<String, List<String>>()
            user["groups"]?.fields()
                ?.forEachRemaining { map[it.key] = it.value.mapNotNull { group -> group.asText() } }
            return map
        }
    }

    fun getCatalogById(id: String): Catalog {

        return catalogRepo.findByIdentifier(id)

    }

    fun setCatalogIdsForUser(userId: String, assignedCatalogs: Set<String>?) {
        val user = userRepo.findByUserId(userId)
        user.data?.catalogIds = assignedCatalogs?.toList()
        userRepo.save(user)
    }

    fun setRecentLoginsForUser(userId: String, recentLogins: Array<Date>) {
        val user = userRepo.findByUserId(userId)
        user.data?.recentLogins = recentLogins.map { it.time }
        userRepo.save(user)
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
        val id = catalog.name.toLowerCase().replace(" ".toRegex(), "_")
        if (!catalogExists(id)) {
            return catalogRepo.save(catalog)
        }
        return getCatalogById(id)
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

    companion object {
        fun toJsonString(map: Any?): String {
            val mapper = ObjectMapper()
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
            return mapper.writeValueAsString(map)
        }
    }
}
