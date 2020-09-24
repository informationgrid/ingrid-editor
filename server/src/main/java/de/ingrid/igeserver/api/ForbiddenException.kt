package de.ingrid.igeserver.api

import org.springframework.http.HttpStatus
import de.ingrid.igeserver.ClientException

open class ForbiddenException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.FORBIDDEN

        private const val ERROR_CODE = "FORBIDDEN"
        private const val ERROR_TEXT = "Failed to authorize user for the requested operation"

        /**
         * Factory method for an unauthorized user
         */
        fun withUser(user: String, cause: Throwable? = null) : ForbiddenException {
            return ForbiddenException(STATUS_CODE, ERROR_CODE, "$ERROR_TEXT: $user", mapOf("user" to user), cause)
        }
    }
}