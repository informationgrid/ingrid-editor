package de.ingrid.igeserver.configuration.acl

import org.springframework.security.acls.domain.DefaultPermissionFactory

class CustomPermissionFactory : DefaultPermissionFactory() {
    init {
        registerPublicPermissions(CustomPermission::class.java)
    }
}