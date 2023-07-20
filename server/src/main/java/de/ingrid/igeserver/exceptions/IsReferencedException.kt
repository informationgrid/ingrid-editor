package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class IsReferencedException(
    statusCode: HttpStatus,
    errorCode: String,
    errorText: String,
    data: Map<String, Any?>? = null,
    cause: Throwable? = null
) : ServerException(statusCode, errorCode, errorText, data, cause) {

    companion object {
        private const val ERROR_CODE = "IS_REFERENCED_ERROR"
        private const val ERROR_CODE_ADDRESS_UNPUBLISH = "IS_REFERENCED_ERROR_ADDRESS_UNPUBLISH"
        private const val ERROR_TEXT = "The document is referenced and cannot be deleted"
        private const val ERROR_TEXT_ADDRESS = "The address is referenced by published dataset"

        /**
         * Factory method for an arbitrary reason
         */
        fun byUuids(uuids: List<String>): IsReferencedException {
            return IsReferencedException(STATUS_CODE, ERROR_CODE, ERROR_TEXT, mapOf("uuids" to uuids))
        }
        
        fun addressByPublishedDatasets(uuids: List<String>): IsReferencedException {
            return IsReferencedException(STATUS_CODE, ERROR_CODE_ADDRESS_UNPUBLISH, ERROR_TEXT_ADDRESS, mapOf("uuids" to uuids))
        }
    }
}
