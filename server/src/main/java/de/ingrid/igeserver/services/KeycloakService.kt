package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ConflictException
import de.ingrid.igeserver.api.InvalidParameterException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.UnauthenticatedException
import de.ingrid.igeserver.model.User
import jakarta.annotation.PostConstruct
import jakarta.ws.rs.ClientErrorException
import jakarta.ws.rs.ForbiddenException
import jakarta.ws.rs.core.Response
import org.apache.logging.log4j.LogManager
import org.jboss.resteasy.client.jaxrs.ResteasyClient
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder
import org.keycloak.KeycloakPrincipal
import org.keycloak.admin.client.CreatedResponseUtil
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
import org.keycloak.admin.client.resource.RolesResource
import org.keycloak.admin.client.resource.UserResource
import org.keycloak.representations.idm.CredentialRepresentation
import org.keycloak.representations.idm.RoleRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Service
import java.io.Closeable
import java.net.URL
import java.security.Principal
import java.util.*


@Service
@Profile("!dev")
class KeycloakService : UserManagementService {

    companion object {
        // 48h * 60min * 60s => 2 days in seconds
        const val EMAIL_VALID_IN_SECONDS = 172800
    }

    class KeycloakCloseableClient(val client: Keycloak, private val realm: String) : Closeable {

        fun realm(): RealmResource {
            return client.realm(realm)
        }

        override fun close() {
            client.close()
        }

    }

    private val log = LogManager.getLogger(KeycloakService::class.java)

    @Value("\${keycloak.auth-server-url}")
    private val keycloakUrl: String? = null

    @Value("\${keycloak.realm:InGrid}")
    private lateinit var keycloakRealm: String

    @Value("\${keycloak.resource}")
    private val keycloakClientId: String? = null

    @Value("\${keycloak.proxy-url:#{null}}")
    private val keycloakProxyUrl: String? = null

    private var proxyHost = "localhost"

    private var proxyPort = 80

    @PostConstruct
    fun init() {
        if (keycloakProxyUrl != null) {
            log.info("Keycloak proxy: $keycloakProxyUrl")
            with(URL(keycloakProxyUrl)) {
                proxyHost = host
                proxyPort = port
            }
        }
    }

    override fun getUsersWithIgeRoles(principal: Principal): Set<User> {
        try {
            initClient(principal).use {
                val roles = it.realm().roles()
                return getUsersWithRole(roles, "ige-user").toSet()
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }
    }

    override fun getUsers(principal: Principal): Set<User> {

        try {
            initClient(principal).use {
                return it.realm().users().list()
                    .map { user -> mapUser(user) }
                    .toSet()
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }

    }

    private fun getUsersWithRole(
        roles: RolesResource,
        roleName: String,
        ignoreUsers: Set<User> = emptySet()
    ): List<User> {
        try {
            val users = roles[roleName].getRoleUserMembers(0, 10000)
                .filter { user -> ignoreUsers.none { ignore -> user.username == ignore.login } }
                .map { user -> mapUser(user) }
            users.forEach { user -> user.role = roleName }
            return users
        } catch (e: jakarta.ws.rs.NotFoundException) {
            log.warn("No users found with role '$roleName'")
            return emptyList()
        }
    }

    private fun initClient(principal: Principal?): KeycloakCloseableClient {
        principal as JwtAuthenticationToken
        val client: Keycloak
//        val keycloakPrincipal = principal// as KeycloakAuthenticationToken?
        val tokenString = principal.token.tokenValue //keycloakPrincipal!!.account.keycloakSecurityContext.tokenString

        client = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .realm(keycloakRealm)
            .clientId(keycloakClientId)
            .authorization(tokenString)
            .resteasyClient(buildResteasyClient())
            .build()

        return KeycloakCloseableClient(client, keycloakRealm)
    }

    private fun buildResteasyClient(): ResteasyClient? {
        val client = ResteasyClientBuilder()
        if (this.keycloakProxyUrl != null) {
            client.defaultProxy(proxyHost, proxyPort)
        }
        return client.connectionPoolSize(10).build()
    }

    override fun getClient(principal: Principal?): KeycloakCloseableClient {
        return initClient(principal)
    }

    override fun getUser(client: Closeable, login: String): User {
        val user = getKeycloakUser(client, login)
        return mapUser(user)
    }

    private fun getKeycloakUser(client: Closeable, username: String): UserRepresentation {
        try {
            return (client as KeycloakCloseableClient).realm().users()
                .search(username, true)
                .first()
        } catch (e: NoSuchElementException) {
            throw NotFoundException.withMissingResource(username, "User")
        } catch (e: Exception) {
            throw UnauthenticatedException.withUser(username, e)
        }
    }

    override fun getLatestLoginDate(client: Closeable, login: String): Date? {
        // This only works for Users with an active Session
        try {
            val userId = getKeycloakUser(client, login).id
            val userSessions = (client as KeycloakCloseableClient).realm().users()[userId].userSessions
            return if (userSessions.isEmpty()) {
                null
            } else {
                Date(userSessions.first().start)
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to get latest login date for '$login'.", e)
        }
    }

    private fun mapUser(user: UserRepresentation): User {
        return User(
            login = user.username,
            firstName = user.firstName ?: "",
            lastName = user.lastName ?: "",
            email = user.email ?: "",
            phoneNumber = user.attributes?.get("phoneNumber")?.get(0)?.toString() ?: "",
            organisation = user.attributes?.get("institution")?.get(0)?.toString() ?: "",
            department = user.attributes?.get("department")?.get(0)?.toString() ?: "",
            latestLogin = null,
//            role = user.realmRoles?.get(0) ?: "" // TODO: get interesting role, like author, md-admin or cat-admin
        )
    }

    override fun getRoles(principal: Authentication): Set<String>? {
//        principal as KeycloakAuthenticationToken
//        return principal.account?.roles
        return emptySet()
    }

    override fun getName(principal: Authentication): String? {
//        principal as KeycloakAuthenticationToken
//        val expiration = principal.account?.keycloakSecurityContext?.token?.exp ?: -99
//        val issuedAt = principal.account?.keycloakSecurityContext?.token?.iat ?: -99
//        log.info("Expiration in: " + Date((expiration.toString() + "000").toLong()))
//        log.info("Issued at: " + Date((issuedAt.toString() + "000").toLong()))
//        return principal.account?.keycloakSecurityContext?.idToken?.name
        return "?"
    }

    override fun getCurrentPrincipal(): Principal? {
        val securityContext: SecurityContext? = SecurityContextHolder.getContext()
        if (securityContext?.authentication is UsernamePasswordAuthenticationToken) {
            return securityContext.authentication
        }
        return securityContext?.authentication?.principal as KeycloakPrincipal<*>?
    }

    override fun userExists(principal: Principal, userId: String): Boolean {
        initClient(principal).use {
            return it.realm().users().search(userId, true).isNotEmpty()
        }
    }

    override fun createUser(principal: Principal, user: User): String {

        initClient(principal).use {
            val usersResource = it.realm().users()
            val password = generatePassword()

            val keycloakUser = mapToKeycloakUser(user).apply {
                requiredActions = listOf("UPDATE_PASSWORD")
                credentials = listOf(CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    isTemporary = true
                    value = password
                })
            }
            val createResponse = usersResource.create(keycloakUser)

            // TODO: boot3 => handleReponseErrors(createResponse) // will throw on error

            val userId = CreatedResponseUtil.getCreatedId(createResponse)

            usersResource.get(userId).apply {
                val roles = it.realm().roles()
                val userRoles = mutableListOf(
                    roles.get("ige-user").toRepresentation(),
                )
                if (userHasAdminRole(user)) userRoles.add(roles.get("ige-user-manager").toRepresentation())
                roles().realmLevel().add(userRoles)

                return password
            }

        }

    }

    override fun updateUser(principal: Principal?, user: User) {

        initClient(principal).use { client ->
            val kcUser = getKeycloakUser(client, user.login)
            mapToKeycloakUser(user, kcUser)

            val userResource = client.realm().users().get(kcUser.id)
            updateKeycloakUser(userResource, kcUser)
            if (userHasAdminRole(user)) {
                userResource.apply {
                    val roles = client.realm().roles()
                    roles().realmLevel().add(mutableListOf(roles.get("ige-user-manager").toRepresentation()))
                }
            }
        }

    }

    private fun updateKeycloakUser(userResource: UserResource, kcUser: UserRepresentation) {
        try {
            userResource.update(kcUser)
        } catch (e: ClientErrorException) {
            if (e.response.status == 409) {
                throw ConflictException.withReason("Conflicting email address")
            } else {
                throw e
            }
        }
    }

    private fun userHasAdminRole(user: User): Boolean {
        return user.role.contains("ige-super-admin") || user.role.contains("cat-admin") || user.role.contains("md-admin")
    }

    private fun handleReponseErrors(createResponse: Response) {

        when (createResponse.status) {
            409 -> throw ConflictException.withReason("New user cannot be created, because another user might have the same email address")
        }

    }

    override fun requestPasswordChange(principal: Principal?, id: String) {

        initClient(principal).use {

            val users = it.realm().users()
            val user = users.search(id, true).getOrNull(0)
            if (user != null) {
                try {
                    users[user.id].executeActionsEmail(listOf("UPDATE_PASSWORD"), EMAIL_VALID_IN_SECONDS)
                } catch (ex: ForbiddenException) {
                    throw de.ingrid.igeserver.api.ForbiddenException.withUser("<current>")
                } catch (ex: Exception) {
                    throw InvalidParameterException.withInvalidParameters(user.email)
                }
            } else {
                throw NotFoundException.withMissingUserCatalog(id)
            }

        }

    }

    override fun resetPassword(principal: Principal?, id: String): String {
        val password = generatePassword()

        initClient(principal).use { client ->
            val kcUser = getKeycloakUser(client, id)
            kcUser.apply {
                    requiredActions = listOf("UPDATE_PASSWORD")
                    credentials = listOf(CredentialRepresentation().apply {
                        type = CredentialRepresentation.PASSWORD
                        isTemporary = true
                        value = password
                    })
                }

            val userResource = client.realm().users().get(kcUser.id)
            updateKeycloakUser(userResource, kcUser)
        }
        return password
    }

    override fun removeRoles(principal: Principal?, userId: String, roles: List<String>) {

        initClient(principal).use { client ->

            val users = client.realm().users()
            val user = users.search(userId, true).getOrNull(0)
            if (user != null) {
                val rolesRepresentations = getRoleRepresentations(client, roles)
                users[user.id].roles().realmLevel().remove(rolesRepresentations)
            } else {
                throw NotFoundException.withMissingUserCatalog(userId)
            }

        }

    }

    override fun addRoles(principal: Principal?, userLogin: String, roles: List<String>) {

        initClient(principal).use { client ->

            val users = client.realm().users()
            val user = users.search(userLogin, true).getOrNull(0)
            if (user != null) {
                val rolesRepresentations = getRoleRepresentations(client, roles)
                users[user.id].roles().realmLevel().add(rolesRepresentations)
            }

        }

    }

    override fun deleteUser(principal: Principal?, userId: String) {
        initClient(principal).use { client ->

            val user = getKeycloakUser(client, userId)
            val users = client.realm().users()
            val userResource = users.get(user.id)

            // delete user if it doesn't contain extra roles
            if (hasOnlyIgeRoles(userResource)) {
                // delete user
                val response = users.delete(user.id)
                if (response.status != 204) {
                    log.error("Error during deleting keycloak user: $userId", response.status)
                }
                return
            }

            // otherwise only remove IGE roles
            removeIgeRoles(client, userResource)

        }
    }

    private fun hasOnlyIgeRoles(userResource: UserResource): Boolean {
        val realmRolesOfUser = userResource.roles().realmLevel().listAll().map { it.name }
        val userRolesNonIge = filterRoles(realmRolesOfUser)
        return userRolesNonIge.isEmpty()
    }

    private fun removeIgeRoles(
        client: KeycloakCloseableClient,
        userResource: UserResource
    ) {
        userResource.apply {
            val roles = client.realm().roles()
            roles().realmLevel().remove(
                listOf(
                    roles.get("ige-user").toRepresentation(),
                    roles.get("ige-user-manager").toRepresentation()
                )
            )
        }
    }

    private fun filterRoles(roles: List<String>): List<String> {
        val ignoreRoles = listOf("default-roles-ingrid", "ige-user", "ige-user-manager", "offline_access", "uma_authorization")
        return roles.filter { !ignoreRoles.contains(it) }
    }

    private fun getRoleRepresentations(client: Closeable, roles: List<String>): List<RoleRepresentation> {

        return (client as KeycloakCloseableClient).realm().roles().list()
            .filter { roles.contains(it.name) }

    }

    private fun mapToKeycloakUser(user: User, existingUserRep: UserRepresentation? = null): UserRepresentation {

        val userRep = existingUserRep ?: UserRepresentation().apply { isEnabled = true }
        userRep.attributes = userRep.attributes ?: mutableMapOf()
        userRep.attributes["phoneNumber"] = listOf( user.phoneNumber)
        userRep.attributes["institution"] = listOf( user.organisation)
        userRep.attributes["department"] = listOf( user.department)

        return userRep.apply {
            username = user.login.lowercase()
            firstName = user.firstName
            lastName = user.lastName
            email = user.email
        }

    }

    // reduced char set for more readable passwords (should only be used for one-time passwords)
    private val letters = listOf('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z')
    private val capitalLetters = listOf('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z')
    private val digits = ('1'..'9')
    private val specialChars = listOf('!', '#', '$', '%', '*', '+', '=', '.', '?')
    private val allChars = letters + capitalLetters + digits + specialChars
    private val passwordLength = 16
    private fun generatePassword(): String {
        // make sure one of each char Type is present
        val oneOfEach = listOf(letters.random(), capitalLetters.random(), digits.random(), specialChars.random())
        var password = List(passwordLength - oneOfEach.size - 1) { allChars.random() } + oneOfEach
        // shuffle to randomize oneOfEach position
        password = password.shuffled()
        // make sure first char is a letter
        password = listOf(letters.random()) + password

        return password.joinToString("")
    }
}
