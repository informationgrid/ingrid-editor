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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import org.springframework.http.HttpStatus

open class ForbiddenException : ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
        super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.FORBIDDEN

        private const val ERROR_CODE = "FORBIDDEN"
        private const val ERROR_TEXT = "Failed to authorize user for the requested operation"

        /**
         * Factory method for an unauthorized user
         */
        fun withUser(user: String, cause: Throwable? = null): ForbiddenException {
            return ForbiddenException(STATUS_CODE, ERROR_CODE, "$ERROR_TEXT: $user", mapOf("user" to user), cause)
        }

        fun withAccessRights(message: String, cause: Throwable? = null): ForbiddenException {
            return ForbiddenException(STATUS_CODE, ERROR_CODE, message, null, cause)
        }
    }
}
