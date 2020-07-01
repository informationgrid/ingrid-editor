package de.ingrid.igeserver.utils

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.exception.OStorageException
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.db.FindOptions
import de.ingrid.igeserver.db.QueryType
import de.ingrid.igeserver.exceptions.DatabaseDoesNotExistException
import de.ingrid.igeserver.model.Catalog
import de.ingrid.igeserver.services.MapperService.Companion.removeDBManagementFields
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

@Service
class DBUtils @Autowired constructor(private val dbService: DBApi, private val authUtils: AuthUtils) {

    private val log = logger()

    fun getCurrentCatalogForPrincipal(principal: Principal?): String? {
        val userId = authUtils.getUsernameFromPrincipal(principal)
        return getCurrentCatalogForUser(userId)
    }

    fun getCurrentCatalogForUser(userId: String): String? {
        val query: MutableMap<String, String> = HashMap()
        query["userId"] = userId

        // TODO: use cache!
        try {
            dbService.acquire("IgeUsers").use {
                val findOptions = FindOptions()
                findOptions.queryType = QueryType.exact
                findOptions.resolveReferences = false
                val list = dbService.findAll("Info", query, findOptions)
                if (list.totalHits == 0L) {
                    val msg = "The user does not seem to be assigned to any database: $userId"
                    log.error(msg)
                }

                // TODO: can this exception be thrown? what about size check above?
                val catInfo = list.hits.stream()
                        .findFirst()
                        .orElseThrow { ApiException(500, "No catalog Info found") }
                var currentCatalogId = if (catInfo.has("currentCatalogId")) catInfo["currentCatalogId"].asText() else null
                if (currentCatalogId == null || currentCatalogId.trim { it <= ' ' } == "") {
                    val catalogIds = catInfo["catalogIds"] as ArrayNode
                    if (catalogIds.size() > 0) {
                        currentCatalogId = catalogIds[0].asText()
                    }
                }
                return currentCatalogId
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    fun getCatalogsForUser(userId: String): Set<String> {
        val query: MutableMap<String, String> = HashMap()
        query["userId"] = userId

        // TODO: use cache!
        try {
            dbService.acquire("IgeUsers").use {
                val findOptions = FindOptions()
                findOptions.queryType = QueryType.exact
                findOptions.resolveReferences = false
                val list = dbService.findAll("Info", query, findOptions)
                if (list.totalHits == 0L) {
                    val msg = "The user does not seem to be assigned to any database: $userId"
                    log.error(msg)
                    // throw new ApiException(500, "User has no assigned catalog");
                }
                return if (list.totalHits == 0L) {
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
        } catch (e: Exception) {
            e.printStackTrace()
            return HashSet()
        }
    }

    fun getCatalogById(id: String?): Catalog? {
        try {
            dbService.acquire(id).use {
                val catalogInfo = dbService.findAll(DBApi.DBClass.Info.name)

                // TODO: can this happen?
                assert(catalogInfo != null && catalogInfo.size > 0)

                val jsonNode = catalogInfo?.get(0)!!
                return Catalog(
                        id,
                        jsonNode.get("name")?.asText() ?: "Unknown",
                        if (jsonNode.has("description")) jsonNode["description"].asText() else "",
                        jsonNode["type"].asText())
            }
        } catch (ex: OStorageException) {
            // in case catalog has been deleted but reference is still there
            // TODO: remove reference from user to deleted catalogs
            log.error("User probably has deleted catalog reference", ex)
            return null
        } catch (ex: DatabaseDoesNotExistException) {
            log.error("The database does not exist: " + ex.message)
            return null
        }
    }

    fun setCatalogIdsForUser(userId: String, assignedCatalogs: Set<String?>?) {
        val query: MutableMap<String, String> = HashMap()
        query["userId"] = userId
        try {
            dbService.acquire("IgeUsers").use {
                val findOptions = FindOptions()
                findOptions.queryType = QueryType.exact
                findOptions.resolveReferences = false
                val list = dbService.findAll("Info", query, findOptions)
                val catUserRef = list.hits[0] as ObjectNode
                catUserRef.putPOJO("catalogIds", assignedCatalogs)
                val id = dbService.getRecordId(catUserRef)
                removeDBManagementFields(catUserRef)
                dbService.save("Info", id, catUserRef.toString())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    companion object {
        @Throws(Exception::class)
        fun toJsonString(map: Any?): String {
            val mapper = ObjectMapper()
            mapper.configure(SerializationFeature.INDENT_OUTPUT, true)
            return mapper.writeValueAsString(map)
        }
    }

}