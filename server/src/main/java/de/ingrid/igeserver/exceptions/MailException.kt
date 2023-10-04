package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class MailException: ServerException {
    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "MAIL_ERROR"
        private const val ERROR_TEXT = "A mail operation threw an error"

        /**
         * Factory method for an arbitrary reason
         */
        fun withException(cause: Throwable): MailException {
            return MailException(STATUS_CODE, ERROR_CODE, cause.message ?: ERROR_TEXT, null, cause)
        }
    }
}
