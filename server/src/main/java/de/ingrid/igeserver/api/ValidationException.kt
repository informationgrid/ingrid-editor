package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import org.springframework.http.HttpStatus

open class ValidationException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "VALIDATION_ERROR"
        private const val ERROR_TEXT_INVALID = "One or more fields are invalid: \${fieldNames}."

        /**
         * Factory method for invalid fields
         */
        fun withInvalidFields(vararg fields: InvalidField, cause: Throwable? = null) : ValidationException {
            val errorText = getErrorText(ERROR_TEXT_INVALID, mapOf("fieldNames" to fields.joinToString(", ") { it -> it.name }))
            return ValidationException(STATUS_CODE, ERROR_CODE, errorText, mapOf("fields" to fields), cause)
        }
    }
}