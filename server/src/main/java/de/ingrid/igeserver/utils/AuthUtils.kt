package de.ingrid.igeserver.utils

import java.security.Principal

interface AuthUtils {

    fun getUsernameFromPrincipal(principal: Principal?): String
}