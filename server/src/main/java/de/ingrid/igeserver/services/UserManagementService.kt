package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.User
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import java.security.Principal
import java.util.*

interface UserManagementService {
    fun getUsers(principal: Principal?): List<User>

    fun getLatestLoginDate(principal: Principal?, login: String): Date

    fun getUser(principal: Principal?, login: String): User
    fun getRoles(principal: KeycloakAuthenticationToken?): Set<String>?
    fun getName(principal: KeycloakAuthenticationToken?): String?

    fun getCurrentPrincipal(): Principal?
}