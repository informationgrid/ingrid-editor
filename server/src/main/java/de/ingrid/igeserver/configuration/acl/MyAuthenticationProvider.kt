package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import java.security.Principal
import java.util.*

//@Service
class MyAuthenticationProvider(
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

        val token = authentication// as KeycloakAuthenticationToken
        val grantedAuthorities: MutableList<GrantedAuthority> = ArrayList()

        var isSuperAdmin = false
        // add keycloak roles
        /*for (role in token.account.roles) {
            if (role.equals("ige-super-admin")) isSuperAdmin = true;
            grantedAuthorities.add(KeycloakRole("ROLE_$role"))
        }*/

        // TODO: make function static
        val username = authUtils.getUsernameFromPrincipal(authentication as Principal);
        var userDb = userRepository.findByUserId(username)
        userDb = checkAndCreateSuperUser(userDb, isSuperAdmin, username)

        val currentCatalogId = userDb?.curCatalog?.id
        if (currentCatalogId != null) {
            val groups = userDb?.groups?.filter { it.catalog?.id == currentCatalogId } ?: ArrayList()

            // add groups
            groups
                .map { it.name }
                .forEach { grantedAuthorities.add(SimpleGrantedAuthority("GROUP_$it")) }


            if (groups.any { it.permissions?.rootPermission == RootPermissionType.WRITE }) {
                grantedAuthorities.add(
                    SimpleGrantedAuthority("SPECIAL_write_root")
                )
            } else if (groups.any { it.permissions?.rootPermission == RootPermissionType.READ }) {
                grantedAuthorities.add(
                    SimpleGrantedAuthority("SPECIAL_read_root")
                )
            }
        }


        // add roles
        val role = userDb?.role?.name
        if (role != null) {
            // add acl access role for everyone
                grantedAuthorities.addAll(
                    listOf(
                        SimpleGrantedAuthority(role),
                        SimpleGrantedAuthority("ROLE_ACL_ACCESS")
                    )
                )

        }

        return authentication!! //KeycloakAuthenticationToken(token.account, token.isInteractive, grantedAuthorities)

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
        return true // false // KeycloakAuthenticationToken::class.java.isAssignableFrom(authentication)
    }

}
