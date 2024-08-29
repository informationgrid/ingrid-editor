/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence

import de.ingrid.igeserver.api.ConflictException
import org.springframework.http.HttpStatus

/**
 * An exception signaling that an object could not be updated in the database, because
 * the database version of the object is newer.
 */
open class ConcurrentModificationException : ConflictException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
        super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "VERSION_CONFLICT"
        private const val ERROR_TEXT = "Could not update object with id '%s'. The database version is newer than the record version."

        /**
         * Factory method for a conflicting resource
         */
        fun withConflictingResource(id: String, databaseVersion: Int, recordVersion: Int, cause: Throwable? = null): ConcurrentModificationException {
            return ConcurrentModificationException(
                STATUS_CODE,
                ERROR_CODE,
                ERROR_TEXT.format(id),
                mapOf("id" to id, "databaseVersion" to databaseVersion, "recordVersion" to recordVersion),
                cause,
            )
        }
    }
}
