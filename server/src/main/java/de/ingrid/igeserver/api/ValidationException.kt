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
        private const val ERROR_TEXT_INVALID = "One or more fields are invalid: \${fieldNames}."
        private const val ERROR_TEXT = "The validation failed for this document"

        /**
         * Factory method for invalid fields
         */
        fun withInvalidFields(vararg fields: InvalidField, cause: Throwable? = null) : ValidationException {
            val errorText = getErrorText(ERROR_TEXT_INVALID, mapOf("fieldNames" to fields.joinToString(", ") { it.name }))
            return ValidationException(STATUS_CODE, ERROR_CODE, errorText, mapOf("fields" to fields), cause)
        }

        fun withReason(data: Any?, cause: Throwable? = null, errorCode: String? = null) : ValidationException {
            return ValidationException(STATUS_CODE, errorCode ?: ERROR_CODE, ERROR_TEXT, mapOf("error" to data), cause)
        }
    }
}
