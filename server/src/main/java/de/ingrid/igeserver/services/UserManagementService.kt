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

import de.ingrid.igeserver.model.User
import org.keycloak.representations.idm.UserRepresentation
import org.springframework.security.core.Authentication
import java.io.Closeable
import java.security.Principal
import java.util.*

interface UserManagementService {
    fun getUsersWithIgeRoles(principal: Principal): Set<User>
    fun getUsers(principal: Principal): Set<User>

    fun getClient(principal: Principal? = null): Closeable

    fun getLatestLoginDate(client: Closeable, login: String): Date?

    fun getUser(client: Closeable, login: String): User
    fun getKeycloakUserWithUuid(client: Closeable, uuid: String): UserRepresentation
    fun getRoles(principal: Authentication): Set<String>?
    fun getName(principal: Principal): String?

    fun getCurrentPrincipal(): Principal?
    fun userExists(principal: Principal, userId: String): Boolean

    /**
     * Returns the temporary password for the new user
     */
    fun createUser(principal: Principal, user: User): String
    fun updateUser(principal: Principal?, user: User)
    fun requestPasswordChange(principal: Principal?, id: String)
    fun resetPassword(principal: Principal?, id: String): String

    fun removeRoles(principal: Principal?, userId: String, roles: List<String>)
    fun addRoles(principal: Principal?, userLogin: String, roles: List<String>)
    fun deleteUser(principal: Principal?, userId: String)
    fun initAdminClient(): KeycloakService.KeycloakCloseableClient
}
