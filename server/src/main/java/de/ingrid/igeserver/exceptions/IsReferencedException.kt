package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class IsReferencedException: ServerException {
    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "IS_REFERENCED_ERROR"
        private const val ERROR_TEXT = "The document is referenced and cannot be deleted"

        /**
         * Factory method for an arbitrary reason
         */
        fun byUuids(uuids: List<String>): IsReferencedException {
            return IsReferencedException(STATUS_CODE, ERROR_CODE, ERROR_TEXT, mapOf("uuids" to uuids))
        }
    }
}
