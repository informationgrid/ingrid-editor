package de.ingrid.igeserver.persistence

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

open class PersistenceException: ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "PERSISTENCE_ERROR"

        private const val ERROR_CODE_NOT_UNIQUE = "NOT_UNIQUE"
        private const val ERROR_TEXT_NOT_UNIQUE = "More than one entity of type '\${resourceType}' with id '\${resourceId}' found in database '\${database}'."

        /**
         * Factory method for an unexpected ambiguity of entities
         */
        fun withMultipleEntities(resourceId: String, resourceType: String?, database: String?) : PersistenceException {
            return PersistenceException(STATUS_CODE, ERROR_CODE_NOT_UNIQUE, ERROR_TEXT_NOT_UNIQUE,
                    mapOf("resourceId" to resourceId, "resourceType" to resourceType, "database" to database))
        }

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null) : PersistenceException {
            return PersistenceException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }
    }
}