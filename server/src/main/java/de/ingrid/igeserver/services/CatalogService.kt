package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.persistence.PersistenceException
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
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

        val currentCatalogId = when (userData.containsKey("currentCatalogId")) {
            true -> userData["currentCatalogId"].toString()
            else -> null
        }

        return when (currentCatalogId != null && currentCatalogId.trim() != "") {
            true -> currentCatalogId
            else -> {
                // ... or first catalog, if existing
                val catalogIds = userData["catalogIds"] as List<String>?
                if (catalogIds == null || catalogIds.size == 0) {
                    throw NotFoundException.withMissingUserCatalog(userId)
                }
                catalogIds[0]
            }
        }
    }

    fun getCatalogsForUser(userId: String): Set<String> {

        val userData = userRepo.findByUserId(userId).data

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            HashSet()
        } else {
            val catalogIds = userData["catalogIds"]
            return if (catalogIds == null) HashSet() else (catalogIds as List<String>).toSet()
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {

        val userData = userRepo.findByUserId(userId).data

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            mutableListOf()
        } else (userData["recentLogins"] as List<Long>?)
            ?.map { Date(it) }
            ?.toMutableList() ?: mutableListOf()
    }

    fun getCatalogById(id: String): Catalog {

        return catalogRepo.findByIdentifier(id)

    }

    fun setCatalogIdsForUser(userId: String, assignedCatalogs: Set<String?>?) {
        this.setFieldForUser(userId, "catalogIds", assignedCatalogs as Any)
    }

    fun setRecentLoginsForUser(userId: String, recentLogins: Array<Date>) {
        this.setFieldForUser(userId, "recentLogins", recentLogins as Any)
    }

    fun getAvailableCatalogs(): List<CatalogProfile> {
        return catalogProfiles
    }

    private fun setFieldForUser(userId: String, fieldId: String, fieldValue: Any) {

        val user = userRepo.findByUserId(userId)

        if (user.data == null) {
            user.data = EmbeddedMap().apply {
                put(fieldId, fieldValue)
            }
        } else {
            user.data?.put(fieldId, fieldValue)
        }

        userRepo.save(user)
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
