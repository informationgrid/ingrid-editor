package de.ingrid.igeserver.configuration.acl

import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.model.Permission

class CustomPermission : BasePermission {
    protected constructor(mask: Int) : super(mask)
    protected constructor(mask: Int, code: Char) : super(mask, code)

    companion object {
        @JvmField val WRITE_ONLY_SUBTREE: Permission = CustomPermission(1 shl 5, 'S')
    }
}