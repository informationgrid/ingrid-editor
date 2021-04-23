package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ConflictException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Message.Companion.dateService
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
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
import kotlin.collections.HashMap

@Service
class CatalogService @Autowired constructor(
    private val dbService: DBApi,
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

        val currentCatalogId = when (userData.containsKey("currentCatalogId") && userData["currentCatalogId"] != null) {
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

        val userData = userRepo.findByUserId(userId)

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            HashSet()
        } else {
            val catalogIds = userData.getCatalogIds()
            return catalogIds.toSet()
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {

        val userData = userRepo.findByUserId(userId)?.data

        return if (userData == null) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            mutableListOf()
        } else (userData["recentLogins"] as List<Long>?)
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

        val catalog = catalogRepo.findByIdentifier(id)

        return Catalog(
            id,
            catalog.name,
            catalog.description ?: "",
            catalog.type ?: "",
            catalog.created,
            catalog.modified
            
        )
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

    fun setGroupsForUser(userId: String, groups: List<String>) {
        val allGroupsForUser = getAllGroupsForUser(userId)
        allGroupsForUser[dbService.currentCatalog!!] = groups
        this.setFieldForUser(userId, "groups", allGroupsForUser as Any)
    }

    private fun setFieldForUser(userId: String, fieldId: String, fieldValue: Any) {

        val user = userRepo.findByUserId(userId)

        if (user == null) {
            log.warn("Tried setting user info for one that does not exist: $userId")
            return
        }

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

    fun getUser(userId: String): JsonNode? {
        val query = listOf(QueryField("userId", userId))
        val findOptions = FindOptions(
            queryType = QueryType.EXACT,
            resolveReferences = false
        )
        val list = dbService.findAll(UserInfoType::class, query, findOptions)
        return if (list.totalHits == 0L) {
            log.error("The user '$userId' does not seem to be assigned to any catalog.")
            null
        } else {
            list.hits[0]
        }
    }

    fun convertUserIdToDB_ID(userId: String): String? {
        return getUser(userId)?.let { dbService.getRecordId(it) }
    }

    fun createUser(user: User) {

        dbService.acquireDatabase().use {
            val userFromDB = getUser(user.login)
            if (userFromDB == null) {
                val node = jacksonObjectMapper().createObjectNode().apply {
                    put("userId", user.login)
                    set<ArrayNode>("groups", jacksonObjectMapper().createArrayNode())
                }

                dbService.save(UserInfoType::class, null, node.toString())
            }
            setFieldForUser(user.login, "creationDate", Date(dateService?.now()?.toEpochSecond() ?: 0))
            setFieldForUser(user.login, "modificationDate", Date(dateService?.now()?.toEpochSecond() ?: 0))
            setGroupsForUser(user.login, user.groups.toList())
        }

    }

    fun deleteUser(userId: String) {

        dbService.acquireDatabase().use {
            dbService.remove(UserInfoType::class, userId)
        }

    }

    fun updateUser(user: User) {

        dbService.acquireDatabase().use {
            val userFromDB = getUser(user.login)
                ?: throw ConflictException.withReason("Cannot update user '${user.login}'. User not found.")
            val node = jacksonObjectMapper().createObjectNode().apply {
                put("userId", user.login)
                set<ArrayNode>("groups", jacksonObjectMapper().createArrayNode())
            }
            dbService.save(UserInfoType::class, dbService.getRecordId(userFromDB), node.toString())
            setGroupsForUser(user.login, user.groups.toList())
            setFieldForUser(user.login, "modificationDate", Date(dateService?.now()?.toEpochSecond() ?: 0))
        }

    }

    companion object {
        fun toJsonString(map: Any?): String {
            val mapper = ObjectMapper()
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
            return mapper.writeValueAsString(map)
        }
    }
}
