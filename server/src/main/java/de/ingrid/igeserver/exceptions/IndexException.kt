package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

open class IndexException: ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "INDEXING_ERROR"
        private const val ERROR_CODE_CANCEL = "INDEXING_CANCELED"
        private const val ERROR_CODE_FOLDER_WITH_NO_CHILDREN = "FOLDER_WITH_NO_CHILDREN"
        private const val ERROR_TEXT_MISSING = "Value '\${valueName}' is missing or empty."

        /**
         * Factory method for missing configuration value
         */
        fun wasCancelled() : IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE_CANCEL, "Indexing was cancelled")
        }

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null): IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }
        
        fun folderWithNoPublishedDocs(uuid: String): IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE_FOLDER_WITH_NO_CHILDREN, uuid)
        }
    }
}