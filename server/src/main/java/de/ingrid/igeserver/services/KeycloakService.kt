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
import org.jboss.resteasy.client.jaxrs.internal.ResteasyClientBuilderImpl
import org.keycloak.OAuth2Constants
import org.keycloak.admin.client.CreatedResponseUtil
import org.keycloak.admin.client.Keycloak
import org.keycloak.admin.client.KeycloakBuilder
import org.keycloak.admin.client.resource.RealmResource
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
import java.io.InputStream
import java.net.URI
import java.security.Principal
import java.util.*

@Service
@Profile("!dev")
class KeycloakService : UserManagementService {

    companion object {
        // 48h * 60min * 60s => 2 days in seconds
        const val ROLE_IGE_USER = "ige-user"
        const val EMAIL_VALID_IN_SECONDS = 172800
    }

    class KeycloakWithRealm(val client: Keycloak, private val realm: String) {

        fun realm(): RealmResource = client.realm(realm)
    }

    private val log = LogManager.getLogger(KeycloakService::class.java)

    @Value("\${keycloak.backend-user}")
    private val backendUser: String? = null

    @Value("\${keycloak.backend-user-password}")
    private val backendUserPassword: String? = null

    @Value("\${keycloak.auth-server-url}")
    private val keycloakUrl: String? = null

    @Value("\${keycloak.realm:InGrid}")
    private lateinit var keycloakRealm: String

    @Value("\${frontend.keycloak.resource}")
    lateinit var keycloakClientId: String

    @Value("\${keycloak.proxy-url:#{null}}")
    private val keycloakProxyUrl: String? = null

    private var proxyHost = "localhost"

    private var proxyPort = 80

    private lateinit var keycloakClient: KeycloakWithRealm

    @PostConstruct
    fun init() {
        if (keycloakProxyUrl != null) {
            log.info("Keycloak proxy: $keycloakProxyUrl")
            with(URI(keycloakProxyUrl).toURL()) {
                proxyHost = host
                proxyPort = port
            }
        }
        initAdminClient()
    }

    override fun getUsersWithIgeRoles(): Set<User> {
        try {
            val realm = keycloakClient.realm()
            val usersWithRole = getUsersWithRole(realm).toSet()
            val userInGroupsWithRole = getUsersInGroupsWithRole(realm).toSet()
            return usersWithRole + userInGroupsWithRole
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }
    }

    override fun getUsers(): Set<User> {
        try {
            return keycloakClient.realm().users().list()
                .map { user -> mapUser(user) }
                .toSet()
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to retrieve users.", e)
        }
    }

    private fun getUsersWithRole(
        realm: RealmResource,
        ignoreUsers: Set<User> = emptySet(),
    ): List<User> = try {
        val roles = realm.roles()
        val users = roles[ROLE_IGE_USER].getUserMembers(0, 10000)
            .filter { user -> ignoreUsers.none { ignore -> user.username == ignore.login } }
            .map { user -> mapUser(user) }
        users.forEach { user -> user.role = ROLE_IGE_USER }
        users
    } catch (e: jakarta.ws.rs.NotFoundException) {
        log.warn("No users found with role '$ROLE_IGE_USER'")
        emptyList()
    }

    private fun getUsersInGroupsWithRole(
        realm: RealmResource,
        ignoreUsers: Set<User> = emptySet(),
    ): List<User> = try {
        val groups = realm.groups()

        realm.roles()[ROLE_IGE_USER].getRoleGroupMembers(0, 1000)
            .flatMap { groups.group(it.id).members() }
            .filter { user -> ignoreUsers.none { ignore -> user.username == ignore.login } }
            .map { mapUser(it) }
    } catch (e: jakarta.ws.rs.NotFoundException) {
        log.warn("No groups with users found with role '$ROLE_IGE_USER'")
        emptyList()
    }

    fun initAdminClient(): KeycloakWithRealm {
        val client: Keycloak = KeycloakBuilder.builder()
            .serverUrl(keycloakUrl)
            .realm(keycloakRealm)
            .clientId(keycloakClientId)
            .grantType(OAuth2Constants.PASSWORD)
            .username(backendUser)
            .password(backendUserPassword)
            .resteasyClient(buildResteasyClient())
            .build()

        keycloakClient = KeycloakWithRealm(client, keycloakRealm)
        return keycloakClient
    }

    private fun buildResteasyClient(): ResteasyClient? {
        val client = ResteasyClientBuilderImpl()
        if (this.keycloakProxyUrl != null) {
            client.defaultProxy(proxyHost, proxyPort)
        }
        return client.connectionPoolSize(10).build()
    }

    override fun getUser(login: String): User {
        val user = getKeycloakUser(login)
        return mapUser(user)
    }

    private fun getKeycloakUser(username: String): UserRepresentation {
        try {
            return keycloakClient.realm().users()
                .search(username, true)
                .first()
        } catch (e: NoSuchElementException) {
            throw NotFoundException.withMissingResource(username, "User")
        } catch (e: Exception) {
            throw UnauthenticatedException.withUser(username, e)
        }
    }

    override fun getKeycloakUserWithUuid(uuid: String): UserRepresentation {
        try {
            return keycloakClient.realm().users()
                .search("id:$uuid", 1, 1)
                .first()
        } catch (e: NoSuchElementException) {
            throw NotFoundException.withMissingResource(uuid, "User")
        } catch (e: Exception) {
            throw UnauthenticatedException.withUser(uuid, e)
        }
    }

    override fun getLatestLoginDate(login: String): Date? {
        // This only works for Users with an active Session
        try {
            val userId = getKeycloakUser(login).id
            val userSessions = keycloakClient.realm().users()[userId].userSessions
            return if (userSessions.isEmpty()) {
                null
            } else {
                Date(userSessions.first().start)
            }
        } catch (e: Exception) {
            throw ServerException.withReason("Failed to get latest login date for '$login'.", e)
        }
    }

    private fun mapUser(user: UserRepresentation): User = User(
        login = user.username,
        firstName = user.firstName ?: "",
        lastName = user.lastName ?: "",
        email = user.email ?: "",
        phoneNumber = user.attributes?.get("phoneNumber")?.get(0)?.toString() ?: "",
        organisation = user.attributes?.get("institution")?.get(0)?.toString() ?: "",
        department = user.attributes?.get("department")?.get(0)?.toString() ?: "",
        latestLogin = null,
        fromLdap = user.federationLink != null,
    )

    override fun getRoles(principal: Authentication): Set<String>? {
        principal as JwtAuthenticationToken
        return principal.authorities.map { it.authority }.toSet()
    }

    override fun getName(principal: Principal): String? = when (principal) {
        is UsernamePasswordAuthenticationToken -> principal.name
        is JwtAuthenticationToken -> principal.token.claims["preferred_username"]?.toString() ?: principal.name
        else -> null
    }

    override fun getCurrentPrincipal(): Principal? {
        val securityContext: SecurityContext? = SecurityContextHolder.getContext()
        if (securityContext?.authentication is UsernamePasswordAuthenticationToken) {
            return securityContext.authentication
        }
        return securityContext?.authentication as JwtAuthenticationToken?
    }

    override fun userExists(userId: String): Boolean = keycloakClient.realm().users().search(userId, true).isNotEmpty()

    override fun createUser(user: User): String {
        val usersResource = keycloakClient.realm().users()
        val password = generatePassword()

        val keycloakUser = mapToKeycloakUser(user).apply {
            requiredActions = listOf("UPDATE_PASSWORD")
            credentials = listOf(
                CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    isTemporary = true
                    value = password
                },
            )
        }
        val createResponse = usersResource.create(keycloakUser)

        handleReponseErrorsForUser(createResponse) // will throw on error

        val userId = CreatedResponseUtil.getCreatedId(createResponse)

        usersResource.get(userId).apply {
            val roles = keycloakClient.realm().roles()
            val userRoles = mutableListOf(
                roles.get(ROLE_IGE_USER).toRepresentation(),
            )
            roles().realmLevel().add(userRoles)

            return password
        }
    }

    override fun updateUser(user: User) {
        val kcUser = getKeycloakUser(user.login)
        mapToKeycloakUser(user, kcUser)

        val userResource = keycloakClient.realm().users().get(kcUser.id)
        updateKeycloakUser(userResource, kcUser)
    }

    private fun updateKeycloakUser(userResource: UserResource, kcUser: UserRepresentation) {
        try {
            userResource.update(kcUser)
        } catch (e: ClientErrorException) {
            handleReponseErrorsForUser(e.response)
        }
    }

    private fun handleReponseErrorsForUser(error: Response) {
        if (error.status < 400) return

        val extraInfo = if (error.entity is InputStream) {
            (error.entity as InputStream).reader().readText()
        } else {
            null
        }
        log.error("Error creating/updating user: $extraInfo")

        when (error.status) {
            409 -> throw ConflictException.withReason("New user cannot be created, because another user might have the same email address")
            else -> throw ServerException.withReason("Error creating user: $extraInfo")
        }
    }

    override fun requestPasswordChange(id: String) {
        val users = keycloakClient.realm().users()
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

    override fun resetPassword(id: String): String {
        val password = generatePassword()

        val kcUser = getKeycloakUser(id)
        kcUser.apply {
            requiredActions = listOf("UPDATE_PASSWORD")
            credentials = listOf(
                CredentialRepresentation().apply {
                    type = CredentialRepresentation.PASSWORD
                    isTemporary = true
                    value = password
                },
            )
        }

        val userResource = keycloakClient.realm().users().get(kcUser.id)
        updateKeycloakUser(userResource, kcUser)
        return password
    }

    override fun removeRoles(userId: String, roles: List<String>) {
        val users = keycloakClient.realm().users()
        val user = users.search(userId, true).getOrNull(0)
        if (user != null) {
            val rolesRepresentations = getRoleRepresentations(roles)
            users[user.id].roles().realmLevel().remove(rolesRepresentations)
        } else {
            throw NotFoundException.withMissingUserCatalog(userId)
        }
    }

    override fun addRoles(userLogin: String, roles: List<String>) {
        val users = keycloakClient.realm().users()
        val user = users.search(userLogin, true).getOrNull(0)
        if (user != null) {
            val rolesRepresentations = getRoleRepresentations(roles)
            users[user.id].roles().realmLevel().add(rolesRepresentations)
        }
    }

    override fun deleteUser(userId: String) {
        val user = getKeycloakUser(userId)
        val users = keycloakClient.realm().users()
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
        removeIgeRoles(keycloakClient, userResource)
    }

    private fun hasOnlyIgeRoles(userResource: UserResource): Boolean {
        val realmRolesOfUser = userResource.roles().realmLevel().listAll().map { it.name }
        val userRolesNonIge = filterRoles(realmRolesOfUser)
        return userRolesNonIge.isEmpty()
    }

    private fun removeIgeRoles(
        client: KeycloakWithRealm,
        userResource: UserResource,
    ) {
        userResource.apply {
            val roles = client.realm().roles()
            roles().realmLevel().remove(
                listOf(
                    roles.get(ROLE_IGE_USER).toRepresentation(),
                ),
            )
        }
    }

    private fun filterRoles(roles: List<String>): List<String> {
        val ignoreRoles =
            listOf("default-roles-ingrid", ROLE_IGE_USER, "offline_access", "uma_authorization")
        return roles.filter { !ignoreRoles.contains(it) }
    }

    private fun getRoleRepresentations(roles: List<String>): List<RoleRepresentation> = keycloakClient.realm().roles().list()
        .filter { roles.contains(it.name) }

    private fun mapToKeycloakUser(user: User, existingUserRep: UserRepresentation? = null): UserRepresentation {
        val userRep = existingUserRep ?: UserRepresentation().apply { isEnabled = true }
        userRep.attributes = userRep.attributes ?: mutableMapOf()
        userRep.attributes["phoneNumber"] = listOf(user.phoneNumber)
        userRep.attributes["institution"] = listOf(user.organisation)
        userRep.attributes["department"] = listOf(user.department)

        return userRep.apply {
            username = user.login.lowercase()
            firstName = user.firstName
            lastName = user.lastName
            email = user.email
        }
    }

    // reduced char set for more readable passwords (should only be used for one-time passwords)
    private val letters = ('a'..'z').toList()
    private val capitalLetters = ('A'..'Z').toList()
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
