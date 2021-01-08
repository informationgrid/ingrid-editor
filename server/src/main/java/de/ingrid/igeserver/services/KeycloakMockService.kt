package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.User
import org.apache.logging.log4j.LogManager
import org.keycloak.KeycloakPrincipal
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

@Service
@Profile("dev")
class KeycloakMockService : UserManagementService {
    private val log = LogManager.getLogger(KeycloakMockService::class.java)

    @Value("\${dev.user.roles:}")
    lateinit var mockedUserRoles: Array<String>

    @Value("\${dev.user.login:}")
    lateinit var mockedLogin: String

    @Value("\${dev.user.firstName:}")
    lateinit var mockedFirstName: String

    @Value("\${dev.user.lastName:}")
    lateinit var mockedLastName: String

    override fun getUsers(principal: Principal?): List<User> {
        val mockUsers: MutableList<User> = ArrayList()
        val user = User("1", mockedLogin, mockedFirstName, mockedLastName)
        mockUsers.add(user)
        return mockUsers
    }

    override fun getLatestLoginDate(principal: Principal?, login: String): Date {
        return Date()
    }

    override fun getRoles(principal: KeycloakAuthenticationToken?): Set<String> {
        return HashSet(Arrays.asList(*mockedUserRoles))
    }

    override fun getName(principal: KeycloakAuthenticationToken?): String {
        return "$mockedFirstName $mockedLastName"
    }

    override fun getUser(principal: Principal?, login: String): User {
        return User("1", mockedLogin, mockedFirstName, mockedLastName)
    }

    override fun getCurrentPrincipal(): Principal? {
        return Principal { mockedLogin }
    }
}
