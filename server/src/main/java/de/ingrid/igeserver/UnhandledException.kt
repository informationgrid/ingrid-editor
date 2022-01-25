package de.ingrid.igeserver

import org.springframework.http.HttpStatus

open class UnhandledException: ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "UNEXPECTED_INTERNAL_ERROR"

        /**
         * Factory method for an arbitrary cause
         */
        fun withCause(cause: Throwable) : UnhandledException {
            return UnhandledException(STATUS_CODE, ERROR_CODE, cause.localizedMessage ?: cause.toString(), null, cause)
        }
    }
}