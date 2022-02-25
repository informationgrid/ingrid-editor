package de.ingrid.igeserver.utils

import java.security.Principal

interface AuthUtils {

    fun getUsernameFromPrincipal(principal: Principal): String
    fun getFullNameFromPrincipal(principal: Principal): String
    fun containsRole(principal: Principal, role: String): Boolean
    fun isAdmin(principal: Principal): Boolean
}