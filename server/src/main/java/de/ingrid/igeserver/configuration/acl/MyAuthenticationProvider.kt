package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.keycloak.adapters.springsecurity.account.KeycloakRole
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import org.springframework.stereotype.Service
import java.util.*
import kotlin.collections.ArrayList

@Service
class MyAuthenticationProvider @Autowired constructor(
    val userRepository: UserRepository,
    val roleRepository: RoleRepository,
    val authUtils: AuthUtils
) : AuthenticationProvider {

    private var grantedAuthoritiesMapper: GrantedAuthoritiesMapper? = null

    fun setGrantedAuthoritiesMapper(grantedAuthoritiesMapper: GrantedAuthoritiesMapper?) {
        this.grantedAuthoritiesMapper = grantedAuthoritiesMapper
    }

    // TODO: try to cache function since it's been called on each request
    override fun authenticate(authentication: Authentication?): Authentication {

        val token = authentication as KeycloakAuthenticationToken
        val grantedAuthorities: MutableList<GrantedAuthority> = ArrayList()

        var isSuperAdmin = false
        // add keycloak roles
        for (role in token.account.roles) {
            if (role.equals("ige-super-admin")) isSuperAdmin = true;
            grantedAuthorities.add(KeycloakRole("ROLE_$role"))
        }

        // TODO: make function static
        val username = authUtils.getUsernameFromPrincipal(authentication);
        var userDb = userRepository.findByUserId(username)
        userDb = checkAndCreateSuperUser(userDb, isSuperAdmin, username)

        // add groups
        userDb?.groups
            ?.map { it.name }
            ?.forEach { grantedAuthorities.add(SimpleGrantedAuthority("GROUP_$it")) }

        // add roles
        val role = userDb?.role?.name
        if (role != null) {
            // add special role for administrators to allow group acl management
            if (role == "cat-admin" || role == "md-admin" || role == "ige-super-admin") {
                grantedAuthorities.addAll(
                    listOf(
                        SimpleGrantedAuthority(role),
                        SimpleGrantedAuthority("ROLE_GROUP_MANAGER")
                    )
                )
            } else {
                grantedAuthorities.addAll(listOf(SimpleGrantedAuthority(role)))
            }
        }

        return KeycloakAuthenticationToken(token.account, token.isInteractive, grantedAuthorities)

    }

    private fun checkAndCreateSuperUser(
        userDb: UserInfo?,
        isSuperAdmin: Boolean,
        username: String
    ): UserInfo? {
        var userDb1 = userDb
        if (userDb1 == null && isSuperAdmin) {
            // create user for super admin in db
            userDb1 = UserInfo().apply {
                userId = username
                role = roleRepository.findByName("ige-super-admin")
                data = UserInfoData().apply {
                    this.creationDate = Date()
                    this.modificationDate = Date()
                }
            }
            userRepository.save(userDb1)
        }
        return userDb1
    }

    override fun supports(authentication: Class<*>?): Boolean {
        return KeycloakAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

}
