package de.ingrid.igeserver.api

import org.springframework.http.HttpStatus
import de.ingrid.igeserver.ClientException

open class ConflictException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.CONFLICT

        private const val ERROR_CODE = "CONFLICT"

        private const val ERROR_CODE_MOVING = "CONFLICT_WHEN_MOVING"

        private const val ERROR_CODE_COPYING = "CONFLICT_WHEN_COPYING"

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null) : ConflictException {
            return ConflictException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }

        fun withMoveConflict(reason: String, cause: Throwable? = null) : ConflictException {
            return ConflictException(STATUS_CODE, ERROR_CODE_MOVING, reason, null, cause)
        }

        fun withCopyConflict(reason: String, cause: Throwable? = null) : ConflictException {
            return ConflictException(STATUS_CODE, ERROR_CODE_COPYING, reason, null, cause)
        }
    }
}