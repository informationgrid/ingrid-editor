package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.User
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.security.core.Authentication
import java.io.Closeable
import java.security.Principal
import java.util.*

interface UserManagementService {
    fun getUsersWithIgeRoles(principal: Principal): Set<User>
    fun getUsers(principal: Principal?): Set<User>
    
    fun getClient(principal: Principal?): Closeable

    fun getLatestLoginDate(client: Closeable, login: String): Date?

    fun getUser(client: Closeable, login: String): User
    fun getRoles(principal: Authentication): Set<String>?
    fun getName(principal: Authentication): String?

    fun getCurrentPrincipal(): Principal?
    fun userExists(principal: Principal, userId: String): Boolean
    fun createUser(principal: Principal, user: User)
    fun updateUser(principal: Principal?, user: User)
    fun requestPasswordChange(principal: Principal?, id: String)

    fun removeRoles(principal: Principal?, userId: String, roles: List<String>)
    fun addRoles(principal: Principal?, userLogin: String, roles: List<String>)
}
