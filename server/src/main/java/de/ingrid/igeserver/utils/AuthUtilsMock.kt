package de.ingrid.igeserver.utils

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.security.Principal

@Service
@Profile("dev")
class AuthUtilsMock : AuthUtils {

    @Value("\${dev.user.login:}")
    lateinit var mockedLogin: String

    override fun getUsernameFromPrincipal(principal: Principal?): String {
        // return a user for development when security is switched off
        return mockedLogin
    }

}