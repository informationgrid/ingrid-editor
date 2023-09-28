package de.ingrid.igeserver

import org.springframework.http.HttpStatus

/**
 * Base class for exceptions that are caused by invalid request to the REST API
 */
open class TransferResponsibilityException: IgeException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.BAD_REQUEST

        private const val ERROR_CODE = "TRANSFER_RESPONSIBILITY_EXCEPTION"

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null, data: Map<String, Any?>? = null) : TransferResponsibilityException {
            return TransferResponsibilityException(STATUS_CODE, ERROR_CODE, reason, data, cause)
        }
    }
}
