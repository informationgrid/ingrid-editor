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
package de.ingrid.igeserver.development

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.kotlin.logger
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.acls.model.NotFoundException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.security.Principal
import java.util.*

@Service
@Profile("dev")
class KeycloakMockService : UserManagementService {
    private val log = logger()

    @Autowired
    lateinit var config: DevelopmentProperties

    override fun getUsersWithIgeRoles(): Set<User> {
        return config.logins?.mapIndexed { index, _ -> mapUser(index) }?.toSet() ?: emptySet()
    }

    override fun getUsers(): Set<User> {
        return getUsersWithIgeRoles()
    }

    override fun getLatestLoginDate(login: String): Date? {
        return Date()
    }

    override fun getRoles(principal: Authentication): Set<String> {
        return principal.authorities.map { it.authority }.toSet()
    }

    override fun getName(principal: Principal): String {
        return principal.name
    }

    override fun getUser(login: String): User {
        val index = config.logins?.indexOf(login) ?: throw NotFoundException("Login not found $login")
        return mapUser(index)
    }

    override fun getKeycloakUserWithUuid(uuid: String): UserRepresentation {
        val index = config.logins?.indexOf(uuid) ?: throw NotFoundException("Login not found $uuid")
        return mapUserRepresentation(index)
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

    private fun mapUserRepresentation(index: Int) = UserRepresentation().apply {
        username = config.logins?.get(index) ?: ""
        firstName = config.firstName?.get(index) ?: ""
        lastName = config.lastName?.get(index) ?: ""
        email = "${config.firstName?.get(index)}.${config.lastName?.get(index)}@test.com"
    }

    override fun getCurrentPrincipal(): Principal? {
        return Principal { config.logins?.get(config.currentUser) ?: "unknown" }
    }

    override fun userExists(userId: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createUser(user: User): String {
        TODO("Not yet implemented")
    }

    override fun requestPasswordChange(id: String) {
        TODO("Not yet implemented")
    }

    override fun resetPassword(id: String): String {
        TODO("Not yet implemented")
    }

    override fun removeRoles(userId: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun addRoles(userLogin: String, roles: List<String>) {
        TODO("Not yet implemented")
    }

    override fun deleteUser(userId: String) {
        TODO("Not yet implemented")
    }

    override fun updateUser(user: User) {
        // do nothing
        log.info("Mocked update user function")
    }
}
