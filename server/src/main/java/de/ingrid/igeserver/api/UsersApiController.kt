/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.TransferResponsibilityException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.MailException
import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.igeserver.model.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.utils.KeycloakAuthUtils.Companion.isAdminRole
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.info.BuildProperties
import org.springframework.boot.info.GitProperties
import org.springframework.core.env.Environment
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.util.*

@RestController
@RequestMapping(path = ["/api"])
class UsersApiController(val behaviourService: BehaviourService) : UsersApi {

    private val logger = logger()

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var groupService: GroupService

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

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

    @Autowired
    private lateinit var email: EmailServiceImpl

    @Value("#{'\${spring.profiles.active:}'.indexOf('dev') != -1}")
    private val developmentMode = false

    @Autowired
    lateinit var generalProperties: GeneralProperties

    override fun createUser(principal: Principal, user: User, newExternalUser: Boolean): ResponseEntity<User> {

        // user login must be lowercase
        validateLoginName(user)

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val userExists = keycloakService.userExists(principal, user.login)
        if (userExists && newExternalUser) {
            throw ConflictException.withReason("User already exists with login ${user.login}")
        }

        logger.debug("Create user ${user.login} (exists in keycloak: $userExists)")

        val createdUser = if (userExists) {
            keycloakService.updateUser(principal, user)
            keycloakService.addRoles(principal, user.login, listOf(user.role))
            val createdUser = catalogService.createUser(catalogId, user)
            if (!developmentMode) {
                logger.info("Send welcome email to existing user '${user.login}' (${user.email})")
                email.sendWelcomeEmail(user.email, user.firstName, user.lastName)
            }
            createdUser

        } else {
            val password = keycloakService.createUser(principal, user)
            val createdUser = catalogService.createUser(catalogId, user)
            if (!developmentMode) {
                logger.info("Send welcome email to '${user.login}' (${user.email})")
                email.sendWelcomeEmailWithPassword(
                    user.email,
                    user.firstName,
                    user.lastName,
                    password,
                    user.login
                )
            }
            createdUser
        }
        if (developmentMode) logger.info("Skip sending welcome mail as development mode is active.")

        return ResponseEntity.ok(getSingleUser(principal, createdUser.userId))
    }

    private fun validateLoginName(user: User) {
        if (user.login != user.login.lowercase()) {
            throw ClientException.withReason("user.login must be lowercase")
        } else if (user.login.contains(" ")) {
            throw ClientException.withReason("user.login must not have spaces")
        }
    }

    @Transactional(noRollbackFor = [MailException::class])
    override fun deleteUser(principal: Principal, userId: Int): ResponseEntity<Void> {
        val frontendUser =
            userRepo.findByIdOrNull(userId) ?: throw NotFoundException.withMissingUserCatalog(userId.toString())
        val login = frontendUser.userId

        if (!catalogService.canEditUser(principal, login)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val deleted = catalogService.deleteUser(catalogId, login)
        // if user really deleted (only was connected to one catalog)
        if (deleted) {
            if (!developmentMode) {
                keycloakService.getClient().use { client ->
                    val user = keycloakService.getUser(client, login)
                    logger.info("Send deletion email to '${user.login}' (${user.email})")
                    try {
                        email.sendDeletionEmail(
                            user.email,
                            user.firstName,
                            user.lastName,
                            user.login
                        )
                    } catch (ex: Exception) {
                        throw MailException.withException(ex)
                    }
                }
            }
            keycloakService.deleteUser(principal, login)
        }

        return ResponseEntity.ok().build()

    }

    override fun getUser(principal: Principal, userId: Int): ResponseEntity<User> {
        val frontendUser =
            userRepo.findByIdOrNull(userId) ?: throw NotFoundException.withMissingUserCatalog(userId.toString())

        if (!catalogService.canEditUser(principal, frontendUser.userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        keycloakService.getClient().use { client ->

            val login = frontendUser.userId
            val user = keycloakService.getUser(client, login)

            user.latestLogin = this.getMostRecentLoginForUser(login)

            val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
            catalogService.applyIgeUserInfo(user, frontendUser, catalogId)
            return ResponseEntity.ok(user)
        }

    }


    override fun getFullName(principal: Principal, userId: Int): ResponseEntity<String> {
        val frontendUser =
            userRepo.findByIdOrNull(userId) ?: throw NotFoundException.withMissingUserCatalog(userId.toString())

        keycloakService.getClient().use { client ->
            val login = frontendUser.userId
            val user = keycloakService.getUser(client, login)
            return ResponseEntity.ok(user.firstName + " " + user.lastName)
        }

    }

    private fun getSingleUser(principal: Principal, userId: String): User? {
        keycloakService.getClient().use { client ->


            val user = try {
                keycloakService.getUser(client, userId)
            } catch (e: Exception) {
                logger.error("Couldn't find keycloak user with login: $userId")
                return null
            }

            val frontendUser =
                userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)

            user.latestLogin = this.getMostRecentLoginForUser(userId)

            val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
            catalogService.applyIgeUserInfo(user, frontendUser, catalogId)
            return user
        }
    }

    override fun list(principal: Principal): ResponseEntity<List<User>> {
        // return all users except superadmins for superadmins and katadmins
        if (authUtils.isAdmin(principal)) {
            val allUsers = catalogService.getAllCatalogUsers(principal)
            return ResponseEntity.ok(allUsers.filter { it.role != "ige-super-admin" })
        }
        val userIds = catalogService.getAllCatalogUserIds(principal)
            .filter { catalogService.canEditUser(principal, it) }

        return ResponseEntity.ok(userIds.mapNotNull { getSingleUser(principal, it) })

    }

    override fun getResponsibilities(principal: Principal, userId: Int): ResponseEntity<List<Int>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        return ResponseEntity.ok(
            docWrapperRepo.findAllByCatalog_IdentifierAndResponsibleUser_Id(catalogId, userId).map { it.id!! })
    }

    override fun reassignResponsibilities(principal: Principal, oldUserId: Int, newUserId: Int): ResponseEntity<Void> {
        val newResponsibleUser =
            userRepo.findByIdOrNull(newUserId) ?: throw NotFoundException.withMissingUserCatalog(newUserId.toString())

        if (!catalogService.canEditUser(principal, newResponsibleUser.userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }


        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val docs = docWrapperRepo.findAllByCatalog_IdentifierAndResponsibleUser_Id(catalogId, oldUserId)

        // check new user has rights on all docs
        if (!isAdminRole(newResponsibleUser.role?.name)) {
            val userGroups = newResponsibleUser.getGroupsForCatalog(catalogId).toList()
            val docsWithoutAccess = docs.filter { !groupService.hasAnyGroupAccess(catalogId, userGroups, it.id!!) }
            if (docsWithoutAccess.isNotEmpty()) {
                val docIds = docsWithoutAccess.map { it.uuid }
                throw TransferResponsibilityException.withReason(
                    "User ${newResponsibleUser.userId} has no access to documents with ids: $docIds",
                    data = mapOf("docIds" to docIds)
                )
            }
        }


        docs.forEach { it.responsibleUser = newResponsibleUser }
        docWrapperRepo.saveAll(docs)
        return ResponseEntity.ok().build()
    }


    override fun listCatAdmins(principal: Principal, catalogId: String): ResponseEntity<List<User>> {
        val filteredUsers =
            catalogService.getAllCatalogUsers(principal, catalogId).filter { user -> user.role == "cat-admin" }
        return ResponseEntity.ok(filteredUsers)
    }


    override fun updateUser(principal: Principal, user: User): ResponseEntity<User> {
        if (!catalogService.canEditUser(principal, user.login)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        keycloakService.updateUser(principal, user)
        catalogService.updateUser(catalogId, user)
        return ResponseEntity.ok(getSingleUser(principal, user.login))

    }


    override fun updateCurrentUser(principal: Principal, user: User): ResponseEntity<Void> {
        // TODO set access rights so users can update their own info, but nothing else. especially not other users.
        val userId = authUtils.getUsernameFromPrincipal(principal)
        keycloakService.getClient().use { client ->
            val kcUser = keycloakService.getUser(client, userId)

            user.apply {
                login = userId
                firstName = user.firstName.ifBlank { kcUser.firstName }
                lastName = user.lastName.ifBlank { kcUser.lastName }
                email = user.email.ifBlank { kcUser.email }
            }
            keycloakService.updateUser(principal, user)
        }
        return ResponseEntity.ok().build()
    }

    override fun currentUserInfo(principal: Principal): ResponseEntity<de.ingrid.igeserver.model.UserInfo> {
        principal as Authentication

        val userId = authUtils.getUsernameFromPrincipal(principal)
        keycloakService.getClient(principal).use { client ->
            val user = keycloakService.getUser(client, userId)


            val lastLogin = this.updateAndGetLastLogin(principal, user.login)
            val dbUser = catalogService.getUser(userId)
            val permissions = try {
                catalogService.getPermissions(principal)
            } catch (ex: Exception) {
                emptyList()
            }

            val currentCatalog = dbUser?.curCatalog ?: dbUser?.catalogs?.elementAtOrNull(0)
            val groups = currentCatalog?.let { cat ->
                dbUser?.getGroupsForCatalog(cat.identifier)?.map { it.name!! }?.toSet()
            } ?: emptySet()
            val assignedCatalogs = if (authUtils.isSuperAdmin(principal)) catalogService.getCatalogs() else dbUser?.catalogs?.toList() ?: emptyList()

            val userInfo = UserInfo(
                id = dbUser?.id,
                login = user.login,
                name = user.firstName + ' ' + user.lastName,
                lastName = user.lastName,
                firstName = user.firstName,
                email = user.email,
                assignedCatalogs = assignedCatalogs,
                role = dbUser?.role?.name,
                groups = groups,
                currentCatalog = currentCatalog,
                version = getVersion(),
                lastLogin = lastLogin,
                externalHelp = generalProperties.externalHelp,
                useElasticsearch = env.activeProfiles.contains("elasticsearch"),
                permissions = permissions,
                plugins = behaviourService.get(currentCatalog?.identifier ?: "???")
            )
            try {
                userInfo.currentCatalog?.type?.let {
                    userInfo.parentProfile = catalogService.getCatalogProfile(it).parentProfile
                }
            } catch (ex: NotFoundException) {
                // ignore not activated catalog
                logger.warn(ex.message ?: "Catalog profile not found: ${userInfo.currentCatalog?.type}")
            }
            return ResponseEntity.ok(userInfo)
        }
    }

    private fun getMostRecentLoginForUser(userIdent: String): Date? {
        val recentLogins = catalogService.getRecentLoginsForUser(userIdent)
        return if (recentLogins.isEmpty()) null else recentLogins[recentLogins.size - 1]
    }

    private fun updateAndGetLastLogin(principal: Principal, userIdent: String): Date? {
        keycloakService.getClient(principal).use { client ->
            val lastLoginKeyCloak = keycloakService.getLatestLoginDate(client, userIdent)
            var recentLogins = catalogService.getRecentLoginsForUser(userIdent)
            if (lastLoginKeyCloak != null) {
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
                val user = userRepo.findByUserId(userIdent)
                if (user != null) {
                    catalogService.setRecentLoginsForUser(user, recentLogins.toTypedArray())
                }
            }
            return if (recentLogins.isEmpty()) null else recentLogins[0]
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

    override fun assignUserToCatalog(
        principal: Principal,
        userId: String,
        catalogId: String
    ): ResponseEntity<Void> {
        val catalog = catalogService.getCatalogById(catalogId)
        val user = userRepo.findByUserId(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)

        user.catalogs.add(catalog)
        userRepo.save(user)
        return ResponseEntity.ok().build()
    }

    fun addOrUpdateCatalogAdmin(catalogName: String, userIdent: String) {

        var user = userRepo.findByUserId(userIdent)
        val catalog = catalogService.getCatalogById(catalogName)

        if (user == null) {
            // new user
            user = UserInfo().apply {
                userId = userIdent
                data = UserInfoData()
                catalogs.add(catalog)
            }
        } else {
            user.catalogs.add(catalog)
        }

        userRepo.save(user)
    }

    override fun assignedUsers(principal: Principal, id: String): ResponseEntity<List<String>> {

        val result = catalogService.getUserOfCatalog(id)
            .map { it.userId }

        return ResponseEntity.ok(result)
    }

    override fun switchCatalog(principal: Principal, catalogId: String): ResponseEntity<Catalog> {

        val userId = authUtils.getUsernameFromPrincipal(principal)

        val user = userRepo.findByUserId(userId)?.apply {
            curCatalog = catalogService.getCatalogById(catalogId)
        } ?: throw NotFoundException.withMissingUserCatalog(userId)

        userRepo.save(user)
        return ResponseEntity.ok(user.curCatalog)
    }

    override fun refreshSession(): ResponseEntity<Void> {
        // nothing to do here since session already is refreshed by http request

        return ResponseEntity.ok().build()
    }

    override fun listExternal(principal: Principal): ResponseEntity<List<User>> {

        val users = keycloakService.getUsersWithIgeRoles(principal)

        // remove users that are already present in this instance
        val allIgeUserIds = catalogService.getAllIgeUserIds()
        val filteredUsers = users.filter { !allIgeUserIds.contains(it.login) }

        return ResponseEntity.ok(filteredUsers)

    }

    override fun listInternal(principal: Principal): ResponseEntity<List<String>> {
        val allIgeUserIds = catalogService.getAllIgeUserIds()
        return ResponseEntity.ok(allIgeUserIds)
    }

    override fun requestPasswordChange(principal: Principal, id: String): ResponseEntity<Void> {

        keycloakService.requestPasswordChange(principal, id)
        return ResponseEntity.ok().build()

    }

    override fun resetPassword(principal: Principal, id: String): ResponseEntity<Void> {
        keycloakService.getClient().use { client ->

            val user = keycloakService.getUser(client, id)
            val password = keycloakService.resetPassword(principal, id)
            logger.debug("Reset password for user $id to $password")
            if (!developmentMode) email.sendResetPasswordEmail(
                user.email,
                user.firstName,
                user.lastName,
                password,
                user.login
            )
            return ResponseEntity.ok().build()
        }
    }


}
