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

import de.ingrid.igeserver.repository.UserRepository
import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Primary
import org.springframework.context.annotation.Profile
import org.springframework.security.acls.model.NotFoundException
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service


@Profile("dev")
@Primary
@Service
class AuthenticationProviderMock : AuthenticationProvider {

    @Autowired
    lateinit var config: DevelopmentProperties

    @Autowired
    lateinit var userRepo: UserRepository

    override fun authenticate(authentication: Authentication?): Authentication {

        val userId = config.logins?.get(config.currentUser)
            ?: throw NotFoundException("The user ${config.currentUser} could not be found in application-dev.properties")

        val user = BasicUserPrincipal(userId)
        val userDb = userRepo.findByUserId(userId)
        val groups = userDb?.groups?.map { SimpleGrantedAuthority("GROUP_${it.id}") } ?: emptyList()
        val role = userDb?.role?.name
        val roles = if (role == null) {
            emptyList()
        } else {
            // add acl access role for everyone
            listOf(SimpleGrantedAuthority("ROLE_$role"), SimpleGrantedAuthority(role), SimpleGrantedAuthority("ROLE_ACL_ACCESS"))

        }
        return UsernamePasswordAuthenticationToken(user, "", groups + roles )
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return true
    }

}
