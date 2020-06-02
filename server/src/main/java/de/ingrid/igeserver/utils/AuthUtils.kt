package de.ingrid.igeserver.utils

import de.ingrid.igeserver.api.ApiException
import java.security.Principal

interface AuthUtils {

    @Throws(ApiException::class)
    fun getUsernameFromPrincipal(principal: Principal?): String

}