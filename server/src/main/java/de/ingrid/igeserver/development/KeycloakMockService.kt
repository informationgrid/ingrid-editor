/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.development

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.services.KeycloakService
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.kotlin.logger
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
    private val log = logger()

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

    override fun getName(principal: Principal): String {
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

    override fun initAdminClient(): KeycloakService.KeycloakCloseableClient {
        TODO("Not yet implemented")
    }

    override fun updateUser(principal: Principal?, user: User) {
        // do nothing
        log.info("Mocked update user function")
    }
}
