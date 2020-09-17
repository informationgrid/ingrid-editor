package de.ingrid.igeserver

import org.springframework.http.HttpStatus

/**
 * Base class for exceptions that occur while processing a valid request to the REST API
 */
open class ServerException: IgeException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.INTERNAL_SERVER_ERROR

        private const val ERROR_CODE = "INTERNAL_ERROR"
        private const val ERROR_TEXT = "The operation has failed, but detailed information is not available."

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null) : ServerException {
            return ServerException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }
    }
}