package de.ingrid.igeserver.configuration.acl

import org.springframework.security.acls.AclPermissionEvaluator
import org.springframework.security.core.Authentication
import java.io.Serializable

class MockedPermissionEvaluator: AclPermissionEvaluator(null) {
    override fun hasPermission(authentication: Authentication?, domainObject: Any?, permission: Any?): Boolean {
        return true
    }

    override fun hasPermission(
        authentication: Authentication?,
        targetId: Serializable?,
        targetType: String?,
        permission: Any?
    ): Boolean {
        return true
    }
}