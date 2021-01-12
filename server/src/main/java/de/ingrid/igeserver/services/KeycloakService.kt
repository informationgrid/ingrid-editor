package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.UnauthenticatedException
import de.ingrid.igeserver.model.User
import org.apache.http.HttpResponse
import org.apache.http.client.methods.HttpGet
import org.apache.http.client.utils.URIBuilder
import org.apache.http.impl.client.HttpClientBuilder
import org.apache.logging.log4j.LogManager
import org.keycloak.KeycloakPrincipal
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.keycloak.representations.idm.UserRepresentation
import org.keycloak.representations.idm.UserSessionRepresentation
import org.keycloak.util.JsonSerialization
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

@Service
@Profile("!dev")
class KeycloakService : UserManagementService {
    private val log = LogManager.getLogger(KeycloakService::class.java)

    @Value("\${keycloak.auth-server-url}")
    private val keycloakUrl: String? = null

    @Value("\${keycloak.realm}")
    private val keycloakRealm: String? = null

    private class UserList : ArrayList<UserRepresentation>() {
        private val serialVersionUID = -5810388584187302144L
    }

    private class SessionList : ArrayList<UserSessionRepresentation>() {
        private val serialVersionUID = -7540118001695537791L
    }

    override fun getUsers(principal: Principal?): List<User> {
        try {
            HttpClientBuilder.create().build().use { client ->
                val get = HttpGet("$keycloakUrl/admin/realms/$keycloakRealm/users")
                val keycloakPrincipal = principal as KeycloakAuthenticationToken?
                get.addHeader("Authorization", "Bearer " + keycloakPrincipal!!.account.keycloakSecurityContext.tokenString)
                val response: HttpResponse = client.execute(get)
                val statusCode = response.statusLine.statusCode
                if (statusCode != 200) {
                    throw ServerException.withReason("Keycloak user request failed: " +
                            "${response.statusLine.reasonPhrase} (${response.statusLine.statusCode}).")
                }
                val entity = response.entity
                entity.content.use { `is` ->
                    val users = JsonSerialization.readValue(`is`, UserList::class.java)
                    return mapUsers(users)
                }
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }
    }

    override fun getUser(principal: Principal?, login: String): User {
        return mapUser(getKeycloakUser(principal, login))
    }

    private fun getKeycloakUser(principal: Principal?, username: String): UserRepresentation {
        try {
            HttpClientBuilder.create().build().use { client ->
                val builder = URIBuilder("$keycloakUrl/admin/realms/$keycloakRealm/users")
                builder.setParameter("username", username)
                val get = HttpGet(builder.build())
                val keycloakPrincipal = principal as KeycloakAuthenticationToken?
                get.addHeader("Authorization", "Bearer " + keycloakPrincipal!!.account.keycloakSecurityContext.tokenString)
                val response: HttpResponse = client.execute(get)
                if (response.statusLine.statusCode != 200) {
                    throw ServerException.withReason("Keycloak authentication request for '$username' failed: " +
                            "${response.statusLine.reasonPhrase} (${response.statusLine.statusCode}).")
                }
                val entity = response.entity
                entity.content.use { `is` ->
                    // FIXME Make sure first match is always the right one
                    return JsonSerialization.readValue(`is`, UserList::class.java).getOrElse(0) { UserRepresentation() }
                }
            }
        } catch (e: Exception) {
            throw UnauthenticatedException.withUser(username, e)
        }
    }

    override fun getLatestLoginDate(principal: Principal?, login: String): Date {
        val userId = getKeycloakUser(principal, login).id
        try {
            HttpClientBuilder.create().build().use { client ->
                val get = HttpGet("$keycloakUrl/admin/realms/$keycloakRealm/users/$userId/sessions")
                val keycloakPrincipal = principal as KeycloakAuthenticationToken?
                get.addHeader("Authorization", "Bearer " + keycloakPrincipal!!.account.keycloakSecurityContext.tokenString)
                val response: HttpResponse = client.execute(get)
                if (response.statusLine.statusCode != 200) {
                    throw ServerException.withReason("Keycloak sessions request for '$login' failed: " +
                            "${response.statusLine.reasonPhrase} (${response.statusLine.statusCode}).")
                }
                val entity = response.entity
                entity.content.use { `is` ->
                    val sessions = JsonSerialization.readValue(`is`, SessionList::class.java)
                    // TODO Figure out if latest (length-1) or oldest (0) session is the wanted value
                    //UserSessionRepresentation session = sessions.get( 0 );
                    val session = sessions[sessions.size - 1]
                    return Date(session.start)
                }
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to get latest login date for '$login'.", e)
        }
    }

    private fun mapUser(user: UserRepresentation): User {
        return User(user.username, user.firstName, user.lastName, "", emptyList())
    }

    private fun mapUsers(users: UserList): List<User> {
        return users.map { user -> mapUser(user) }
    }

    override fun getRoles(principal: KeycloakAuthenticationToken?): Set<String>? {
        return principal?.account?.roles
    }

    override fun getName(principal: KeycloakAuthenticationToken?): String? {
        val expiration = principal?.account?.keycloakSecurityContext?.token?.expiration ?: -99
        val issuedAt = principal?.account?.keycloakSecurityContext?.token?.issuedAt ?: -99
        log.info("Expiration in: " + Date((expiration.toString() + "000").toLong()))
        log.info("Issued at: " + Date((issuedAt.toString() + "000").toLong()))
        return principal?.account?.keycloakSecurityContext?.idToken?.name
    }

    override fun getCurrentPrincipal(): Principal? {
        val securityContext: SecurityContext? = SecurityContextHolder.getContext()
        return securityContext?.authentication?.principal as KeycloakPrincipal<*>?
    }
}
