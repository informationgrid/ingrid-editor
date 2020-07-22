package de.ingrid.igeserver.api

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.keycloak.representations.AccessTokenResponse
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.io.IOException
import java.security.Principal
import java.util.*
import javax.naming.NoPermissionException
import org.springframework.boot.info.BuildProperties;
import org.springframework.boot.info.GitProperties

@RestController
@RequestMapping(path = ["/api"])
class UsersApiController : UsersApi {

    val logger = logger()

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var dbService: DBApi

    @Autowired
    private lateinit var keycloakService: UserManagementService

    @Autowired
    private lateinit var authUtils: AuthUtils

    @Autowired(required = false)
    private var buildInfo: BuildProperties? = null

    @Autowired(required = false)
    private var gitInfo: GitProperties? = null

    @Value("#{'\${spring.profiles.active:}'.indexOf('dev') != -1}")
    private val developmentMode = false

    override fun createUser(id: String, user: User1): ResponseEntity<Void> {

        // do some magic!
        return ResponseEntity(HttpStatus.NOT_IMPLEMENTED)

    }

    override fun deleteUser(id: String): ResponseEntity<Void> {

        // do some magic!
        return ResponseEntity(HttpStatus.NOT_IMPLEMENTED)

    }

    fun get(): ResponseEntity<Void> {

        // do some magic!
        return ResponseEntity(HttpStatus.NOT_IMPLEMENTED)

    }

    @Throws(IOException::class)
    override fun getUser(principal: Principal?, id: String): ResponseEntity<User> {

        val user = keycloakService.getUser(principal, id)
        return ResponseEntity.ok(user)

    }

    @Throws(IOException::class, NoPermissionException::class)
    override fun list(principal: Principal?, res: AccessTokenResponse): ResponseEntity<List<User>> {

        if (principal == null && !developmentMode) {
            logger.warn("No principal found in request!")
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
        }
        val users = keycloakService.getUsers(principal)
        return if (users == null) {
            ResponseEntity.status(500).body(null)
        } else {
            ResponseEntity.ok(users)
        }

    }

    override fun updateUser(id: String, user: User): ResponseEntity<Void> {

        // do some magic!
        return ResponseEntity(HttpStatus.NOT_IMPLEMENTED)

    }

    @Throws(ApiException::class)
    override fun currentUserInfo(principal: Principal?): ResponseEntity<UserInfo> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val dbIds = catalogService.getCatalogsForUser(userId)
        val dbIdsValid: MutableSet<String> = HashSet()
        val assignedCatalogs: MutableList<Catalog> = ArrayList()
        for (dbId in dbIds) {
            val catalogById = catalogService.getCatalogById(dbId)
            if (catalogById != null) {
                assignedCatalogs.add(catalogById)
                dbIdsValid.add(dbId)
            }
        }

        // clean up catalog association if one was deleted?
        if (dbIds.size != assignedCatalogs.size) {
            catalogService.setCatalogIdsForUser(userId, dbIdsValid)
        }
        val currentCatalogForUser = catalogService.getCurrentCatalogForUser(userId)
        val catalog: Catalog? = catalogService.getCatalogById(currentCatalogForUser)
        val userInfo = UserInfo(
                userId = userId,
                name = keycloakService.getName(principal as KeycloakAuthenticationToken?),
                assignedCatalogs = assignedCatalogs,
                roles = keycloakService.getRoles(principal),
                currentCatalog = catalog,
                version = getVersion())
        return ResponseEntity.ok(userInfo)

    }

    private fun getVersion(): Version {
        return Version(buildInfo?.version, Date.from(buildInfo?.time), gitInfo?.commitId)
    }

    @Throws(ApiException::class)
    override fun setCatalogAdmin(
            principal: Principal?,
            info: CatalogAdmin): ResponseEntity<UserInfo?> {

        try {
            dbService.acquire(DBApi.DATABASE.USERS.dbName).use { _ ->
                logger.info("Parameter: $info")
                val userIds = info.userIds
                val catalogName = info.catalogName
                if (userIds.isEmpty()) {
                    throw ApiException(500, "No user ids set to use as a catalog administrator")
                }

                userIds.forEach { addOrUpdateCatalogAdmin(catalogName, it) }

            }
        } catch (e: JsonProcessingException) {
            logger.error("Error processing JSON", e)
            throw ApiException(e.message)
        } catch (e: Exception) {
            logger.error(e)
        }
        return ResponseEntity.ok(null)

    }

    @Throws(Exception::class)
    private fun addOrUpdateCatalogAdmin(catalogName: String, userId: String) {

        val query = listOf(QueryField("userId", userId));
        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = false)
        val list = dbService.findAll(CatalogInfoType::class, query, findOptions)

        val isNewEntry = list.totalHits == 0L
        val objectMapper = ObjectMapper()
        val catalogIds: MutableSet<String> = HashSet()
        val catInfo: ObjectNode

        if (isNewEntry) {
            catInfo = objectMapper.createObjectNode()
            catInfo.put("userId", userId)
            catInfo.put("catalogIds", objectMapper.createArrayNode())
        } else {
            catInfo = list.hits[0] as ObjectNode
            // make list to hashset
            catInfo.put("catalogIds", catInfo["catalogIds"])
        }
        val catalogIdsArray = catInfo["catalogIds"] as ArrayNode
        for (jsonNode in catalogIdsArray) {
            catalogIds.add(jsonNode.asText())
        }

        // update catadmin in catalog Info
        catalogIds.add(catalogName)

        val arrayNode = objectMapper.createArrayNode()
        catalogIds.forEach { arrayNode.add(it) }
        catInfo.replace("catalogIds", arrayNode)
        var recordId: String? = null
        if (!isNewEntry) {
            recordId = catInfo["@rid"].asText()
        }
        dbService.save(CatalogInfoType::class, recordId, catInfo.toString())

    }

    @Throws(ApiException::class)
    override fun assignedUsers(principal: Principal?, id: String): ResponseEntity<List<String>> {

        val result: MutableList<String> = ArrayList()
        try {
            dbService.acquire(DBApi.DATABASE.USERS.dbName).use { _ ->
                val query = listOf(QueryField("catalogIds", id))
                val findOptions = FindOptions(
                        queryType = QueryType.CONTAINS,
                        resolveReferences = false)
                val infos = dbService.findAll(CatalogInfoType::class, query, findOptions)
                infos.hits.forEach { result.add(it["userId"].asText()) }
            }
        } catch (e: Exception) {
            logger.error("Could not get assigned Users", e)
        }
        return ResponseEntity.ok(result)

    }

    @Throws(ApiException::class)
    override fun switchCatalog(principal: Principal?, catalogId: String): ResponseEntity<Void> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        try {
            dbService.acquire(DBApi.DATABASE.USERS.dbName).use { _ ->
                val query = listOf(QueryField("userId", userId))
                val findOptions = FindOptions(
                        queryType = QueryType.EXACT,
                        resolveReferences = false)
                val info = dbService.findAll(CatalogInfoType::class, query, findOptions)
                if (info.totalHits != 1L) {
                    val message = "User is not defined or more than once in ${DBApi.DATABASE.USERS.dbName}-table: " + info.totalHits
                    logger.error(message)
                    throw ApiException(message)
                }
                val map = info.hits[0] as ObjectNode
                map.put("currentCatalogId", catalogId)
                dbService.save(CatalogInfoType::class, dbService.getRecordId(map), map.toString())
                return ResponseEntity.ok().build()
            }
        } catch (e: Exception) {
            logger.error(e)
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
        }

    }

    override fun refreshSession(): ResponseEntity<Void> {
        // nothing to do here since session already is refreshed by http request

        return ResponseEntity.ok().build()
    }

}