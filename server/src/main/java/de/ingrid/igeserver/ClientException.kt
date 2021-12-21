package de.ingrid.igeserver

import org.springframework.http.HttpStatus

/**
 * Base class for exceptions that are caused by invalid request to the REST API
 */
open class ClientException: IgeException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.BAD_REQUEST

        private const val ERROR_CODE = "INVALID_REQUEST"
        private const val ERROR_TEXT = "The request was invalid, but detailed information is not available."

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null, data: Map<String, Any?>? = null) : ClientException {
            return ClientException(STATUS_CODE, ERROR_CODE, reason, data, cause)
        }
    }
}