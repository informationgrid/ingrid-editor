package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ConflictException
import de.ingrid.igeserver.api.InvalidParameterException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.UnauthenticatedException
import de.ingrid.igeserver.model.User
import org.apache.logging.log4j.LogManager
import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder
import org.keycloak.KeycloakPrincipal
import org.keycloak.OAuth2Constants
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.keycloak.admin.client.CreatedResponseUtil
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
import org.keycloak.admin.client.resource.RolesResource
import org.keycloak.representations.idm.RoleRepresentation
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.io.Closeable
import java.security.Principal
import java.util.*
import javax.ws.rs.core.Response


@Service
@Profile("!dev")
class KeycloakService : UserManagementService {

    companion object {
        // 48h * 60min * 60s => 2 days in seconds
        const val EMAIL_VALID_IN_SECONDS = 172800
    }

    private class KeycloakCloseableClient(val client: Keycloak, private val realm: String) : Closeable {

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

    @Value("\${keycloak.credentials.secret}")
    private val keycloakSecret: String? = null

    override fun getUsersWithIgeRoles(principal: Principal?): Set<User> {
        try {
            initClient(principal).use {
                val roles = it.realm().roles()
                val catAdmins = getUsersWithRole(roles, "cat-admin")
                val mdAdmins = getUsersWithRole(roles, "md-admin", catAdmins.toSet())
                val authors = getUsersWithRole(roles, "author", (catAdmins union mdAdmins))

                return (catAdmins union mdAdmins union authors)
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }
    }

    override fun getUsers(principal: Principal?): Set<User> {

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

    private fun getUsersWithRole(roles: RolesResource, roleName: String, ignoreUsers: Set<User> = emptySet()): List<User> {
        val users = roles[roleName].roleUserMembers
            .filter {user -> ignoreUsers.none {ignore -> user.username == ignore.login } }
            .map { user -> mapUser(user) }

        users.forEach { user -> user.role = roleName }
        return users
    }

    private fun initClient(principal: Principal?): KeycloakCloseableClient {
        val keycloakPrincipal = principal as KeycloakAuthenticationToken?
        val tokenString = keycloakPrincipal!!.account.keycloakSecurityContext.tokenString

        val client = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .grantType(OAuth2Constants.CLIENT_CREDENTIALS)
            .realm(keycloakRealm)
            .clientId(keycloakClientId)
            .clientSecret(keycloakSecret)
            .authorization(tokenString)
            .resteasyClient(ResteasyClientBuilder().connectionPoolSize(10).build())
            .build()

        return KeycloakCloseableClient(client, keycloakRealm)
    }

    override fun getUser(principal: Principal?, login: String): User {
        val user = getKeycloakUser(principal, login)
        initClient(principal).use {
            val realmRoles = it.realm().users().get(user.id).roles().realmLevel().listAll()
            val isCatAdmin = realmRoles.any { role -> role.name == "cat-admin" }
            val isMdAdmin = realmRoles.any { role -> role.name == "md-admin" }
            val isAuthor = realmRoles.any { role -> role.name == "author" }

            val mappedUser = mapUser(user)
            mappedUser.role = when {
                isCatAdmin -> "cat-admin"
                isMdAdmin -> "md-admin"
                isAuthor -> "author"
                else -> ""
            }
            return mappedUser
        }
    }

    private fun getKeycloakUser(principal: Principal?, username: String): UserRepresentation {
        try {
            initClient(principal).use {
                return it.realm().users()
                    .search(username, true)[0]
            }
        } catch (e: Exception) {
            throw UnauthenticatedException.withUser(username, e)
        }
    }

    override fun getLatestLoginDate(principal: Principal?, login: String): Date {
        val userId = getKeycloakUser(principal, login).id
        try {

            initClient(principal).use {
                val userSessions = it.realm().users()[userId].userSessions
                return Date(userSessions.last().start)
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
            email = user.email ?: ""
//            role = user.realmRoles?.get(0) ?: "" // TODO: get interesting role, like author, md-admin or cat-admin
        )
    }

    override fun getRoles(principal: KeycloakAuthenticationToken?): Set<String>? {
        return principal?.account?.roles
    }

    override fun getName(principal: KeycloakAuthenticationToken?): String? {
        val expiration = principal?.account?.keycloakSecurityContext?.token?.exp ?: -99
        val issuedAt = principal?.account?.keycloakSecurityContext?.token?.iat ?: -99
        log.info("Expiration in: " + Date((expiration.toString() + "000").toLong()))
        log.info("Issued at: " + Date((issuedAt.toString() + "000").toLong()))
        return principal?.account?.keycloakSecurityContext?.idToken?.name
    }

    override fun getCurrentPrincipal(): Principal? {
        val securityContext: SecurityContext? = SecurityContextHolder.getContext()
        return securityContext?.authentication?.principal as KeycloakPrincipal<*>?
    }

    override fun userExists(principal: Principal, userId: String): Boolean {
        initClient(principal).use {
            return it.realm().users().search(userId, true).isNotEmpty()
        }
    }

    override fun createUser(principal: Principal, user: User) {

        initClient(principal).use {
            val keycloakUser = mapToKeycloakUser(user)
            val usersResource = it.realm().users()
            val createResponse = usersResource.create(keycloakUser)
            
            handleReponseErrors(createResponse) // will throw on error
            
            val userId = CreatedResponseUtil.getCreatedId(createResponse)

            usersResource.get(userId).apply {
                roles().realmLevel().add(getRoleRepresentation(it.realm(), user))
                
                // send an email to the user to set a password
                try {
                    executeActionsEmail(listOf("UPDATE_PASSWORD"), EMAIL_VALID_IN_SECONDS)
                } catch (ex: Exception) {
                    log.error("Could not send eMail to user: ${user.login}")
                }
            }
        }

    }

    override fun updateUser(principal: Principal, user: User) {

        initClient(principal).use { client ->
            val kcUser = getKeycloakUser(principal, user.login)
            mapToKeycloakUser(user, kcUser)

            client.realm().users().get(kcUser.id).update(kcUser)
        }

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
                } catch (ex: Exception) {
                    throw InvalidParameterException.withInvalidParameters(user.email)
                }
            } else {
                throw NotFoundException.withMissingUserCatalog(id)
            }

        }

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

    private fun getRoleRepresentations(client: KeycloakCloseableClient, roles: List<String>): List<RoleRepresentation> {

        return client.realm().roles().list()
            .filter { roles.contains(it.name) }

    }

    private fun getRoleRepresentation(realmResource: RealmResource, user: User): List<RoleRepresentation> {

        val role = realmResource.roles()
            .get(user.role).toRepresentation()

        return listOf(role)

    }

    private fun mapToKeycloakUser(user: User, existingUserRep: UserRepresentation? = null): UserRepresentation {

        val userRep = existingUserRep ?: UserRepresentation().apply { isEnabled = true }
        
        return userRep.apply {
            username = user.login
            firstName = user.firstName
            lastName = user.lastName
            email = user.email
        }
        
    }
}
