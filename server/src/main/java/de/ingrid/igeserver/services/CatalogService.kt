package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.IntNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ConflictException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Message.Companion.dateService
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogManagerAssignment
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.CatalogProfile
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*
import kotlin.collections.HashMap
import kotlin.collections.HashSet

@Service
class CatalogService @Autowired constructor(
    private val dbService: DBApi,
    private val authUtils: AuthUtils,
    private val catalogProfiles: List<CatalogProfile>
) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal?): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCurrentCatalogForUser(userId: String): String {
        val query = listOf(QueryField("userId", userId))

        dbService.acquireDatabase().use {
            val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = false
            )
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            if (list.totalHits == 0L) {
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            val catInfo = list.hits[0]
            val currentCatalogId = if (catInfo.has("currentCatalogId")) catInfo["currentCatalogId"].asText() else null
            return if (currentCatalogId != null && currentCatalogId.trim { it <= ' ' } != "") {
                // return assigned current catalog ...
                currentCatalogId
            } else {
                // ... or first catalog, if existing
                val catalogIds = catInfo["catalogIds"] as ArrayNode
                if (catalogIds.size() == 0) {
                    throw NotFoundException.withMissingUserCatalog(userId)
                }
                catalogIds[0].asText()
            }
        }
    }

    fun getCatalogsForUser(userId: String): Set<String> {
        // TODO: use cache!
        dbService.acquireDatabase(DBApi.DATABASE.USERS.dbName).use {
            val user = getUser(userId)
            return if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                HashSet()
            } else {
                val catalogIdsArray = user["catalogIds"] as ArrayNode
                val catalogIds: MutableSet<String> = HashSet()
                for (jsonNode in catalogIdsArray) {
                    catalogIds.add(jsonNode.asText())
                }
                catalogIds
            }
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {
        // TODO: use cache?
        dbService.acquireDatabase().use {
            val user = getUser(userId)
            return if (user == null) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                mutableListOf()
            } else {
                val recentLoginsArray = user["recentLogins"] as ArrayNode?
                val recentLogins = mutableListOf<Date>()
                if (recentLoginsArray != null) {
                    for (jsonNode in recentLoginsArray) {
                        recentLogins.add(Date(jsonNode.asLong()))
                    }
                }
                recentLogins
            }
        }
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
        if (!dbService.catalogExists(id)) {
            throw NotFoundException.withMissingResource(id, "Database")
        }
        dbService.acquireCatalog(id).use {
            val catalogInfo = dbService.findAll(CatalogInfoType::class)
            if (catalogInfo.isNotEmpty()) {
                val jsonNode = catalogInfo.filter { it.get("id").textValue() == id }.first()
                return Catalog(
                    id,
                    jsonNode.get("name")?.asText() ?: "Unknown",
                    if (jsonNode.has("description")) jsonNode["description"].asText() else "",
                    jsonNode["type"].asText()
                )
            } else {
                throw NotFoundException.withMissingResource(id, "Database")
            }
        }
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

        dbService.acquireDatabase().use {
            val user = getUser(userId)

            val catUserRef: ObjectNode
            val id: String?
            if (user == null) {
                catUserRef = ObjectMapper().createObjectNode()
                catUserRef.put("userId", userId)
                id = null
            } else {
                catUserRef = user as ObjectNode
                id = dbService.getRecordId(catUserRef)
                dbService.removeInternalFields(catUserRef)
            }
            catUserRef.putPOJO(fieldId, fieldValue)
            dbService.save(UserInfoType::class, id, catUserRef.toString())
        }
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
