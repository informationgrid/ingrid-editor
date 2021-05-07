package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.info.GitProperties
import org.springframework.core.env.Environment
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.util.*

@RestController
@RequestMapping(path = ["/api"])
class UsersApiController : UsersApi {

    private val logger = logger()

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var userRepo: UserRepository

    @Autowired
    private lateinit var keycloakService: UserManagementService

    @Autowired
    private lateinit var authUtils: AuthUtils

    @Autowired
    private lateinit var env: Environment

    @Autowired(required = false)
    private var buildInfo: BuildProperties? = null

    @Autowired(required = false)
    private var gitInfo: GitProperties? = null

    @Value("#{'\${spring.profiles.active:}'.indexOf('dev') != -1}")
    private val developmentMode = false

    override fun createUser(principal: Principal, user: User, newExternalUser: Boolean): ResponseEntity<Void> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val userExists = keycloakService.userExists(principal, user.login)
        if (userExists && newExternalUser) {
            throw ConflictException.withReason("User already Exists with login ${user.login}")
        }

        when (userExists) {
            true -> keycloakService.addRoles(principal, user.login, listOf(user.role))
            false -> keycloakService.createUser(principal, user)
        }

        catalogService.createUser(catalogId, user)

        return ResponseEntity.ok().build()
    }

    override fun deleteUser(principal: Principal?, userId: String): ResponseEntity<Void> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        catalogService.deleteUser(userId)
        keycloakService.removeRoles(principal, userId, listOf("cat-admin", "md-admin", "author"))
        return ResponseEntity.ok().build()

    }

    override fun getUser(principal: Principal?, userId: String): ResponseEntity<User> {

        val user = keycloakService.getUser(principal, userId)
        val frontendUser = userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)

        user.latestLogin = keycloakService.getLatestLoginDate(principal, userId);
        user.groups = frontendUser.groups.map { it.id!! }
        user.creationDate = frontendUser.data?.creationDate ?: Date(0)
        user.modificationDate = frontendUser.data?.modificationDate ?: Date(0)
        user.role = frontendUser.role?.name ?: ""

        //TODO implement manager and standin
        user.manager = "ige"
        user.standin = "herbert"

        return ResponseEntity.ok(user)

    }

    override fun list(principal: Principal?): ResponseEntity<List<User>> {

        if (principal == null && !developmentMode) {
            throw UnauthenticatedException.withUser("")
        }

        val users = keycloakService.getUsersWithIgeRoles(principal)

        // remove users that are not added this instance
        val filteredUsers = users.filter { catalogService.getUser(it.login) != null }

        return ResponseEntity.ok(filteredUsers)
    }

    override fun updateUser(principal: Principal?, id: String, user: User): ResponseEntity<Void> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        keycloakService.updateUser(principal, user)
        catalogService.updateUser(catalogId, user)
        return ResponseEntity.ok().build()

    }

    override fun currentUserInfo(principal: Principal?): ResponseEntity<de.ingrid.igeserver.model.UserInfo> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val user = keycloakService.getUser(principal, userId)

        val roles = keycloakService.getRoles(principal as KeycloakAuthenticationToken?)

        val lastLogin = this.getLastLogin(principal, user.login, roles)
        val dbIds = catalogService.getCatalogsForUser(user.login)
        val dbIdsValid: MutableSet<String> = HashSet()
        val assignedCatalogs: MutableList<Catalog> =
            ArrayList()
        for (dbId in dbIds) {
            val catalogById = catalogService.getCatalogById(dbId)
            assignedCatalogs.add(catalogById)
            dbIdsValid.add(dbId)
        }

        // clean up catalog association if one was deleted?
        if (dbIds.size != assignedCatalogs.size) {
            catalogService.setCatalogIdsForUser(user.login, dbIdsValid)
        }

        val catalog: Catalog? = try {
            val currentCatalogForUser = catalogService.getCurrentCatalogForUser(user.login)
            catalogService.getCatalogById(currentCatalogForUser)
        } catch (ex: NotFoundException) {
            null
        }

        val userInfo = UserInfo(
            userId = user.login,
            name = user.firstName + ' ' + user.lastName,
            lastName = user.lastName, //keycloakService.getName(principal as KeycloakAuthenticationToken?),
            firstName = user.firstName,
            assignedCatalogs = assignedCatalogs,
            roles = roles,
            currentCatalog = catalog,
            version = getVersion(),
            lastLogin = lastLogin,
            useElasticsearch = env.activeProfiles.contains("elasticsearch")
        )
        return ResponseEntity.ok(userInfo)
    }

    private fun getLastLogin(principal: Principal?, userIdent: String, roles: Set<String>?): Date? {
        val lastLoginKeyCloak = keycloakService.getLatestLoginDate(principal, userIdent)
        if (lastLoginKeyCloak != null) {
            var recentLogins = catalogService.getRecentLoginsForUser(userIdent)
            when (recentLogins.size) {
                0 -> recentLogins.addAll(listOf(lastLoginKeyCloak, lastLoginKeyCloak))
                1 -> recentLogins.add(lastLoginKeyCloak)
                else -> {
                    if (recentLogins.size > 2) {
                        logger.warn("More than two recent logins received! Using last 2 values")
                        recentLogins = recentLogins.subList(recentLogins.size - 2, recentLogins.size)
                    }

                    //only update if most recent dates are not equal
                    if (recentLogins[1].compareTo(lastLoginKeyCloak) != 0) {
                        recentLogins = mutableListOf(recentLogins[1], lastLoginKeyCloak)
                    }
                }
            }
            var user = userRepo.findByUserId(userIdent)
            if (user == null && catalogService.isSuperAdmin(roles)) {
                user = UserInfo().apply {
                    userId = userIdent
                    data = UserInfoData()
                }
            }
            if (user != null) {
                catalogService.setRecentLoginsForUser(user, recentLogins.toTypedArray())
            }
            return recentLogins[0]
        }
        return null
    }

    private fun getVersion(): Version {
        return Version(
            buildInfo?.version,
            if (buildInfo != null) Date.from(buildInfo?.time) else null,
            gitInfo?.commitId
        )
    }

    override fun setCatalogAdmin(
        principal: Principal?,
        info: CatalogAdmin
    ): ResponseEntity<de.ingrid.igeserver.model.UserInfo?> {

        val userIds = info.userIds
        if (userIds.isEmpty()) {
            throw InvalidParameterException.withInvalidParameters("info.userIds")
        }

        logger.info("Parameter: $info")
        val catalogName = info.catalogName
        userIds.forEach { addOrUpdateCatalogAdmin(catalogName, it) }
        return ResponseEntity.ok(null)
    }

    private fun addOrUpdateCatalogAdmin(catalogName: String, userIdent: String) {

        var user = userRepo.findByUserId(userIdent)

        val isNewEntry = user == null
        var catalogIds: MutableSet<String> = HashSet()

        if (isNewEntry) {
            user = UserInfo().apply {
                userId = userIdent
                data = UserInfoData()
            }
        } else {
            // make list to hashset
            catalogIds = user?.data?.catalogIds?.toHashSet() ?: HashSet()
        }

        // update catadmin in catalog Info
        catalogIds.add(catalogName)

        user?.data?.catalogIds = catalogIds.toList()
        userRepo.save(user)
    }

    override fun assignedUsers(principal: Principal?, id: String): ResponseEntity<List<String>> {

        val result: MutableList<String> = ArrayList()
        val query = listOf(QueryField("catalogIds", id))
        val findOptions = FindOptions(
            queryType = QueryType.CONTAINS,
            resolveReferences = false
        )
//            val info = dbService.findAll(UserInfoType::class, query, findOptions)
        // TODO: migrate
        val info = userRepo.findAllByCatalogId(id)

        info.forEach { result.add(it.userId) }
        return ResponseEntity.ok(result)
    }

    override fun switchCatalog(principal: Principal?, catalogId: String): ResponseEntity<Void> {

        val userId = authUtils.getUsernameFromPrincipal(principal)

        val user = userRepo.findByUserId(userId)?.apply {
            curCatalog = catalogService.getCatalogById(catalogId)
        } ?: throw NotFoundException.withMissingUserCatalog(userId)

        userRepo.save(user)
        return ResponseEntity.ok().build()
    }

    override fun refreshSession(): ResponseEntity<Void> {
        // nothing to do here since session already is refreshed by http request

        return ResponseEntity.ok().build()
    }

    override fun listExternal(principal: Principal?): ResponseEntity<List<User>> {

        if (principal == null && !developmentMode) {
            throw UnauthenticatedException.withUser("")
        }

        val users = keycloakService.getUsers(principal)

        // remove users that are already present in this instance
        val filteredUsers = users.filter { catalogService.getUser(it.login) == null }

        return ResponseEntity.ok(filteredUsers)

    }

    override fun requestPasswordChange(principal: Principal?, id: String): ResponseEntity<Void> {

        keycloakService.requestPasswordChange(principal, id)
        return ResponseEntity.ok().build()

    }
}
