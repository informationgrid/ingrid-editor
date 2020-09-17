package de.ingrid.igeserver.persistence

import de.ingrid.igeserver.api.ConflictException
import org.springframework.http.HttpStatus

/**
 * An exception signaling that an object could not be updated in the database, because
 * the database version of the object is newer.
 */
open class ConcurrentModificationException: ConflictException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "VERSION_CONFLICT"
        private const val ERROR_TEXT = "Could not update object with id '\$id'. The database version is newer than the record version."

        /**
         * Factory method for a conflicting resource
         */
        fun withConflictingResource(id: String, databaseVersion: Int, recordVersion: Int, cause: Throwable? = null) : ConcurrentModificationException {
            return ConcurrentModificationException(STATUS_CODE, ERROR_CODE, ERROR_TEXT,
                    mapOf("id" to id, "databaseVersion" to databaseVersion, "recordVersion" to recordVersion), cause)
        }
    }
}