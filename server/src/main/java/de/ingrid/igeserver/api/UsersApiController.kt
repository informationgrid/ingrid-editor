package de.ingrid.igeserver.api

import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AssignmentKey
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogManagerAssignment
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.repository.ManagerRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.info.GitProperties
import org.springframework.core.env.Environment
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.util.*
import kotlin.time.ExperimentalTime
import kotlin.time.measureTime

@RestController
@RequestMapping(path = ["/api"])
class UsersApiController : UsersApi {

    private val logger = logger()

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var userRepo: UserRepository

    @Autowired
    private lateinit var managerRepo: ManagerRepository

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

    @Autowired
    private lateinit var email: EmailServiceImpl

    @Value("#{'\${spring.profiles.active:}'.indexOf('dev') != -1}")
    private val developmentMode = false

    override fun createUser(principal: Principal, user: User, newExternalUser: Boolean): ResponseEntity<Void> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        // if user has no manager, set it to creating user
        if (user.manager.isNullOrEmpty()) user.manager = authUtils.getUsernameFromPrincipal(principal)

        val userExists = keycloakService.userExists(principal, user.login)
        if (userExists && newExternalUser) {
            throw ConflictException.withReason("User already Exists with login ${user.login}")
        }
        if (userExists) {
            keycloakService.updateUser(principal, user);
            keycloakService.addRoles(principal, user.login, listOf(user.role))
            catalogService.createUser(catalogId, user)
            if (!developmentMode) email.sendWelcomeEmail(user.email)

        } else {
            val password = keycloakService.createUser(principal, user)
            catalogService.createUser(catalogId, user)
            if (!developmentMode) email.sendWelcomeEmailWithPassword(user.email, password)

        }
        if (developmentMode) logger.info("Skip sending welcome mail as development mode is active.")

        return ResponseEntity.ok().build()
    }

    @Transactional
    override fun deleteUser(principal: Principal, userId: String): ResponseEntity<Void> {

        catalogService.deleteUser(userId)
        // TODO: remove special realm management roles
//        keycloakService.removeRoles(principal, userId, listOf("view-users", "manage-users", "manage-realm"))
        return ResponseEntity.ok().build()

    }

    @ExperimentalTime
    override fun getUser(principal: Principal, userId: String): ResponseEntity<User> {

        var user: User
        val durationALl = measureTime {
            keycloakService.getClient(principal).use { client ->

                val durationGetUser = measureTime {
                    user = keycloakService.getUser(client, userId)
                }
                val frontendUser =
                    userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)

                val durationGetLatestLoginDate = measureTime {
                    user.latestLogin = keycloakService.getLatestLoginDate(client, userId)
                }
                user.groups = frontendUser.groups.map { it.id!! }
                user.creationDate = frontendUser.data?.creationDate ?: Date(0)
                user.modificationDate = frontendUser.data?.modificationDate ?: Date(0)
                user.role = frontendUser.role?.name ?: ""
                user.organisation = frontendUser.data?.organisation ?: ""

                user.manager = managerRepo.findByUserAndCatalogIdentifier(
                    frontendUser,
                    catalogService.getCurrentCatalogForPrincipal(principal)
                )?.manager?.userId ?: ""

                // TODO implement manager and standin
                //user.standin = "herbert"

                logger.info("getUser: $durationGetUser")
                logger.info("getLatestLoginDate: $durationGetLatestLoginDate")
            }
        }

        logger.info("all: $durationALl")
        return ResponseEntity.ok(user)

    }

    override fun list(principal: Principal, fromUser: String?): ResponseEntity<List<User>> {

        var filteredUsers = catalogService.getAllCatalogUsers(principal)

        val isCatAdmin = authUtils.isAdmin(principal)
        // return all users for katadmins
        if (isCatAdmin && fromUser.isNullOrEmpty()) {
            return ResponseEntity.ok(filteredUsers)
        }

        // filter for fromUser children. if not set filter for principal children
        val userName = fromUser.orEmpty().ifEmpty { authUtils.getUsernameFromPrincipal(principal) }
        filteredUsers = catalogService.filterUsersForUser(filteredUsers.toSet(), userName).toList()

        return ResponseEntity.ok(filteredUsers)
    }

    override fun listCatAdmins(principal: Principal): ResponseEntity<List<User>> {
        val filteredUsers = catalogService.getAllCatalogUsers(principal).filter { user -> user.role == "cat-admin" }
        return ResponseEntity.ok(filteredUsers)
    }



    override fun updateUser(principal: Principal, id: String, user: User): ResponseEntity<Void> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        keycloakService.updateUser(principal, user)
        catalogService.updateUser(catalogId, user)
        return ResponseEntity.ok().build()

    }

    override fun currentUserInfo(principal: Principal): ResponseEntity<de.ingrid.igeserver.model.UserInfo> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        keycloakService.getClient(principal).use { client ->
            val user = keycloakService.getUser(client, userId)

            val roles = keycloakService.getRoles(principal as Authentication)

            val lastLogin = this.getLastLogin(principal, user.login, roles)
            val dbUser = catalogService.getUser(userId)

            val userInfo = UserInfo(
                userId = user.login,
                name = user.firstName + ' ' + user.lastName,
                lastName = user.lastName, //keycloakService.getName(principal as KeycloakAuthenticationToken?),
                firstName = user.firstName,
                assignedCatalogs = dbUser?.catalogs?.toList() ?: emptyList(),
                role = dbUser?.role?.name,
                groups = roles,
                currentCatalog = dbUser?.curCatalog,
                version = getVersion(),
                lastLogin = lastLogin,
                useElasticsearch = env.activeProfiles.contains("elasticsearch"),
                permissions = catalogService.getPermissions(principal)
            )
            return ResponseEntity.ok(userInfo)
        }
    }

    private fun getLastLogin(principal: Principal, userIdent: String, roles: Set<String>?): Date? {
        keycloakService.getClient(principal).use { client ->
            val lastLoginKeyCloak = keycloakService.getLatestLoginDate(client, userIdent)
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
                if (user != null) {
                    catalogService.setRecentLoginsForUser(user, recentLogins.toTypedArray())
                }
                return recentLogins[0]
            }
            return null
        }
    }

    private fun getVersion(): Version {
        return Version(
            buildInfo?.version,
            if (buildInfo != null) Date.from(buildInfo?.time) else null,
            gitInfo?.commitId
        )
    }

    override fun setCatalogAdmin(
        principal: Principal,
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
        val catalog = catalogService.getCatalogById(catalogName)

        if (isNewEntry) {
            user = UserInfo().apply {
                userId = userIdent
                data = UserInfoData()
                catalogs.add(catalog)
            }
        } else {
            // make list to hashset
            user?.catalogs?.add(catalog)
        }

        userRepo.save(user)
    }

    override fun assignedUsers(principal: Principal, id: String): ResponseEntity<List<String>> {

        val result: MutableList<String> = ArrayList()
        val query = listOf(QueryField("catalogIds", id))
        val findOptions = FindOptions(
            queryType = QueryType.CONTAINS,
            resolveReferences = false
        )
//            val info = dbService.findAll(UserInfoType::class, query, findOptions)
        // TODO: migrate
        val info = catalogService.getUserOfCatalog(id)

        info.forEach { result.add(it.userId) }
        return ResponseEntity.ok(result)
    }

    override fun switchCatalog(principal: Principal, catalogId: String): ResponseEntity<Void> {

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

    override fun listExternal(principal: Principal): ResponseEntity<List<User>> {

        if (principal == null && !developmentMode) {
            throw UnauthenticatedException.withUser("")
        }

        val users = keycloakService.getUsersWithIgeRoles(principal)

        // remove users that are already present in this instance
        val filteredUsers = users.filter { catalogService.getUser(it.login) == null }

        return ResponseEntity.ok(filteredUsers)

    }

    override fun requestPasswordChange(principal: Principal, id: String): ResponseEntity<Void> {

        keycloakService.requestPasswordChange(principal, id)
        return ResponseEntity.ok().build()

    }
}
