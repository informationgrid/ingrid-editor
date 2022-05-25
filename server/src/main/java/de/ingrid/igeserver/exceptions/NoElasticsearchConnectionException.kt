package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

open class NoElasticsearchConnectionException: ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "NO_ELASTICSEARCH_CONNECTION"

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null): NoElasticsearchConnectionException {
            return NoElasticsearchConnectionException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }
    }
}