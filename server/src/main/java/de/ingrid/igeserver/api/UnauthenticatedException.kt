package de.ingrid.igeserver.api

import org.springframework.http.HttpStatus
import de.ingrid.igeserver.ClientException

open class UnauthenticatedException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.UNAUTHORIZED

        private const val ERROR_CODE = "UNAUTHENTICATED"
        private const val ERROR_TEXT = "Failed to authenticate user via Keycloak service"

        /**
         * Factory method for an unauthenticated user
         */
        fun withUser(user: String, cause: Throwable? = null) : UnauthenticatedException {
            return UnauthenticatedException(STATUS_CODE, ERROR_CODE, "$ERROR_TEXT: $user", mapOf("user" to user), cause)
        }
    }
}