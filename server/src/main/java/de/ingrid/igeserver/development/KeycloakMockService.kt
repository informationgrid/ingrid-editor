package de.ingrid.igeserver.development

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.acls.model.NotFoundException
import org.springframework.security.core.Authentication
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
    private companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var config: DevelopmentProperties

    override fun getUsersWithIgeRoles(principal: Principal): Set<User> {
        return config.logins?.mapIndexed { index, _ -> mapUser(index)}?.toSet() ?: emptySet()
    }

    override fun getUsers(principal: Principal): Set<User> {
        return getUsersWithIgeRoles(principal)
    }

    override fun getLatestLoginDate(client: Closeable, login: String): Date? {
        return Date()
    }

    override fun getRoles(principal: Authentication): Set<String> {
        return principal.authorities.map { it.authority }.toSet()
    }

    override fun getName(principal: Authentication): String {
        return principal.name
    }

    override fun getClient(principal: Principal?): Closeable {
        return DummyClient()
    }

    override fun getUser(client: Closeable, login: String): User {
        val index = config.logins?.indexOf(login) ?: throw NotFoundException("Login not found $login")
        return mapUser(index)
    }

    private fun mapUser(index: Int) = User(
        config.logins?.get(index) ?: "",
        config.firstName?.get(index) ?: "",
        config.lastName?.get(index) ?: "",
        "${config.firstName?.get(index)}.${config.lastName?.get(index)}@test.com",
        "",
        "",
        "",
        "",
        emptyList(),
        Date(0),
        Date(0),
        Date(0)
    )

    override fun getCurrentPrincipal(): Principal? {
        return Principal { config.logins?.get(config.currentUser) ?: "unknown" }
    }

    override fun userExists(principal: Principal, userId: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createUser(principal: Principal, user: User): String {
        TODO("Not yet implemented")
    }

    override fun requestPasswordChange(principal: Principal?, id: String) {
        TODO("Not yet implemented")
    }

    override fun resetPassword(principal: Principal?, id: String): String {
        TODO("Not yet implemented")
    }

    override fun removeRoles(principal: Principal?, userId: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun addRoles(principal: Principal?, userLogin: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun deleteUser(principal: Principal?, userId: String) {
        TODO("Not yet implemented")
    }

    override fun updateUser(principal: Principal?, user: User) {
        // do nothing
        log.info("Mocked update user function")
    }
}
