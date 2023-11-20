package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class PostSaveException: ServerException {
    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "POST_SAVE_ERROR"
        private const val ERROR_TEXT = "A post save operation threw an error"

        /**
         * Factory method for an arbitrary reason
         */
        fun withException(cause: Throwable): PostSaveException {
            var message = cause.message ?: ERROR_TEXT
            if (cause.cause?.message != null) message += ": ${cause.cause?.message}"
            return PostSaveException(STATUS_CODE, ERROR_CODE, message, null, cause)
        }
    }
}
