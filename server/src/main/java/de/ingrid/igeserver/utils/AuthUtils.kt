package de.ingrid.igeserver.utils

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import java.security.Principal

interface AuthUtils {

    fun getUsernameFromPrincipal(principal: Principal): String
    fun getFullNameFromPrincipal(principal: Principal): String
    fun containsRole(principal: Principal, role: String): Boolean
    fun isAdmin(principal: Principal): Boolean
    fun isSuperAdmin(principal: Principal): Boolean
    fun getCurrentUserRoles(catalogId: String): Set<Group>
}