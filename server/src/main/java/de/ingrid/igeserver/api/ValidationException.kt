/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

open class ValidationException protected constructor(
    statusCode: HttpStatus,
    errorCode: String,
    errorText: String,
    data: Map<String, Any?>? = null,
    cause: Throwable? = null
) : ClientException(statusCode, errorCode, errorText, data, cause) {

    companion object {
        private const val ERROR_CODE = "VALIDATION_ERROR"
        private const val ERROR_CODE_FIELD = "VALIDATION_ERROR_FIELD"
        private const val ERROR_TEXT_INVALID = "One or more fields are invalid: \${fieldNames}."
        private const val ERROR_TEXT = "The validation failed for this document"

        /**
         * Factory method for invalid fields
         */
        fun withInvalidFields(vararg fields: InvalidField, cause: Throwable? = null) : ValidationException {
            val errorText = getErrorText(ERROR_TEXT_INVALID, mapOf("fieldNames" to fields.joinToString(", ") { it.name }))
            return ValidationException(STATUS_CODE, ERROR_CODE_FIELD, errorText, mapOf("fields" to fields), cause)
        }

        fun withReason(data: Any?, cause: Throwable? = null, errorCode: String? = null) : ValidationException {
            return ValidationException(STATUS_CODE, errorCode ?: ERROR_CODE, ERROR_TEXT, mapOf("error" to data), cause)
        }
    }
}
