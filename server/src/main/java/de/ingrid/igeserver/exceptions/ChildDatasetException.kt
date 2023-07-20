package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class ChildDatasetException(
    statusCode: HttpStatus,
    errorCode: String,
    errorText: String,
    data: Map<String, Any?>? = null,
    cause: Throwable? = null
) : ServerException(statusCode, errorCode, errorText, data, cause) {

    companion object {
        private const val ERROR_CODE = "UNPUBLISH-CHILD_IS_PUBLISHED"
        private const val ERROR_TEXT = "A child dataset is published"

        /**
         * Factory method for an arbitrary reason
         */
        fun mustNotBePublished(uuids: List<String>): ChildDatasetException {
            return ChildDatasetException(STATUS_CODE, ERROR_CODE, ERROR_TEXT, mapOf("uuids" to uuids))
        }
    }
}
