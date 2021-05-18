package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.User
import org.apache.logging.log4j.LogManager
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.io.Closeable
import java.security.Principal
import java.util.*

class DummyClient : Closeable {
    override fun close() {
        // do nothing
    }
}

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

    override fun getUsersWithIgeRoles(principal: Principal?): Set<User> {
        val mockUsers: MutableList<User> = ArrayList()
        val user =
            User(mockedLogin, mockedFirstName, mockedLastName, "", "", "", "", emptyList(), Date(0), Date(0), Date(0))
        mockUsers.add(user)
        return mockUsers.toSet()
    }

    override fun getUsers(principal: Principal?): Set<User> {
        TODO("Not yet implemented")
    }

    override fun getLatestLoginDate(principal: Closeable, login: String): Date? {
        return Date()
    }

    override fun getRoles(principal: KeycloakAuthenticationToken?): Set<String> {
        return HashSet(Arrays.asList(*mockedUserRoles))
    }

    override fun getName(principal: KeycloakAuthenticationToken?): String {
        return "$mockedFirstName $mockedLastName"
    }

    override fun getClient(principal: Principal?): Closeable {
        return DummyClient()
    }

    override fun getUser(principal: Closeable, login: String): User {
        return User(
            mockedLogin,
            mockedFirstName,
            mockedLastName,
            "",
            "",
            "",
            "",
            emptyList(),
            Date(0),
            Date(0),
            Date(0)
        )
    }

    override fun getCurrentPrincipal(): Principal? {
        return Principal { mockedLogin }
    }

    override fun userExists(principal: Principal, userId: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createUser(principal: Principal, user: User) {
        TODO("Not yet implemented")
    }

    override fun requestPasswordChange(principal: Principal?, id: String) {
        TODO("Not yet implemented")
    }

    override fun removeRoles(principal: Principal?, userId: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun addRoles(principal: Principal?, userLogin: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun updateUser(principal: Principal?, user: User) {
        // do nothing
        log.info("Mocked update user function")
    }
}
