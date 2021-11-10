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
        val groups = userDb?.groups?.map { SimpleGrantedAuthority("GROUP_${it.name}") } ?: emptyList()
        val role = userDb?.role?.name
        val roles = if (role == null) {
            emptyList()
        } else {
            // add special role for administrators to allow group acl management
            if (role == "cat-admin" || role == "md-admin" || role == "ige-super-admin") {
                listOf(SimpleGrantedAuthority(role), SimpleGrantedAuthority("ROLE_GROUP_MANAGER"))
            } else {
                listOf(SimpleGrantedAuthority(role))
            }
        }
        return UsernamePasswordAuthenticationToken(user, "", groups + roles )
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return true
    }

}
