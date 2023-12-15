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

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("dev")
class AuthUtilsMock : AuthUtils {

    @Autowired
    lateinit var config: DevelopmentProperties

    override fun getUsernameFromPrincipal(principal: Principal): String {
        // return a user for development when security is switched off
        return config.logins?.get(config.currentUser) ?: "unknown"
    }

    override fun getFullNameFromPrincipal(principal: Principal): String {
        return "${config.firstName?.get(config.currentUser)} ${config.lastName?.get(config.currentUser)}"
    }

    override fun containsRole(principal: Principal, role: String): Boolean {
        principal as Authentication
        return principal.authorities.any { it.authority == role }
    }

    override fun isAdmin(principal: Principal): Boolean {
        return containsRole(principal, "cat-admin") || containsRole(principal, "ige-super-admin")
    }

    override fun isSuperAdmin(principal: Principal): Boolean {
        return containsRole(principal, "ige-super-admin")
    }

    override fun getCurrentUserRoles(catalogId: String): Set<Group> {
        return emptySet()
    }

}