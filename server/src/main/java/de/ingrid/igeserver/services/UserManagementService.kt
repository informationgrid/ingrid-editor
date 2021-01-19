package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.User
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import java.security.Principal
import java.util.*

interface UserManagementService {
    fun getUsersWithIgeRoles(principal: Principal?): Set<User>
    fun getUsers(principal: Principal?): Set<User>

    fun getLatestLoginDate(principal: Principal?, login: String): Date

    fun getUser(principal: Principal?, login: String): User
    fun getRoles(principal: KeycloakAuthenticationToken?): Set<String>?
    fun getName(principal: KeycloakAuthenticationToken?): String?

    fun getCurrentPrincipal(): Principal?
    fun userExists(principal: Principal, userId: String): Boolean
    fun createUser(principal: Principal, user: User)
    fun requestPasswordChange(principal: Principal?, id: String)

    fun removeRoles(principal: Principal?, userId: String, roles: List<String>)
    fun addRoles(principal: Principal?, userLogin: String, roles: List<String>)
}
