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
import java.security.Principal
import java.util.*

interface UserManagementService {
    fun getUsersWithIgeRoles(): Set<User>
    fun getUsers(): Set<User>

    fun getLatestLoginDate(login: String): Date?

    fun getUser(login: String): User
    fun getKeycloakUserWithUuid(uuid: String): UserRepresentation
    fun getRoles(principal: Authentication): Set<String>?
    fun getName(principal: Principal): String?

    fun getCurrentPrincipal(): Principal?
    fun userExists(userId: String): Boolean

    /**
     * Returns the temporary password for the new user
     */
    fun createUser(user: User): String
    fun updateUser( user: User)
    fun requestPasswordChange( id: String)
    fun resetPassword( id: String): String

    fun removeRoles( userId: String, roles: List<String>)
    fun addRoles( userLogin: String, roles: List<String>)
    fun deleteUser( userId: String)
}
