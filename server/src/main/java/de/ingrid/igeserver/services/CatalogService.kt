package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

@Service
class CatalogService @Autowired constructor(private val dbService: DBApi, private val authUtils: AuthUtils) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal?): String {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCurrentCatalogForUser(userId: String): String {
        val query = listOf(QueryField("userId", userId))

        dbService.acquireDatabase(DBApi.DATABASE.USERS.dbName).use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false)
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            if (list.totalHits == 0L) {
                throw NotFoundException.withMissingUserCatalog(userId)
            }

            val catInfo = list.hits[0]
            val currentCatalogId = if (catInfo.has("currentCatalogId")) catInfo["currentCatalogId"].asText() else null
            return if (currentCatalogId != null && currentCatalogId.trim { it <= ' ' } != "") {
                // return assigned current catalog ...
                currentCatalogId
            }
            else {
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
        val query = listOf(QueryField("userId", userId))

        // TODO: use cache!
        dbService.acquireDatabase(DBApi.DATABASE.USERS.dbName).use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false)
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            return if (list.totalHits == 0L) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                HashSet()
            } else {
                val map = list.hits[0]
                val catalogIdsArray = map["catalogIds"] as ArrayNode
                val catalogIds: MutableSet<String> = HashSet()
                for (jsonNode in catalogIdsArray) {
                    catalogIds.add(jsonNode.asText())
                }
                catalogIds
            }
        }
    }

    fun getRecentLoginsForUser(userId: String): MutableList<Date> {
        val query = listOf(QueryField("userId", userId))

        // TODO: use cache?
        dbService.acquireDatabase(DBApi.DATABASE.USERS.dbName).use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false)
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            return if (list.totalHits == 0L) {
                log.error("The user '$userId' does not seem to be assigned to any database.")
                mutableListOf()
            } else {
                val map = list.hits[0]
                val recentLoginsArray = map["recentLogins"] as ArrayNode?
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

    fun getCatalogById(id: String): Catalog {
        if (!dbService.catalogExists(id)) {
            throw NotFoundException.withMissingResource(id, "Database")
        }
        dbService.acquireCatalog(id).use {
            val catalogInfo = dbService.findAll(CatalogInfoType::class)
            if (catalogInfo.isNotEmpty()) {
                val jsonNode = catalogInfo[0]
                return Catalog(
                        id,
                        jsonNode.get("name")?.asText() ?: "Unknown",
                        if (jsonNode.has("description")) jsonNode["description"].asText() else "",
                        jsonNode["type"].asText())
            }
            else {
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

    private fun setFieldForUser(userId: String, fieldId: String, fieldValue: Any) {
        val query = listOf(QueryField("userId", userId))

        dbService.acquireDatabase(DBApi.DATABASE.USERS.dbName).use {
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = false)
            val list = dbService.findAll(UserInfoType::class, query, findOptions)
            val catUserRef: ObjectNode
            val id: String?
            if (list.hits.isEmpty()) {
                catUserRef = ObjectMapper().createObjectNode()
                id = null
            } else {
                catUserRef = list.hits[0] as ObjectNode
                id = dbService.getRecordId(catUserRef)
                dbService.removeInternalFields(catUserRef)
            }
            catUserRef.putPOJO(fieldId, fieldValue)
            dbService.save(UserInfoType::class, id, catUserRef.toString())
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
