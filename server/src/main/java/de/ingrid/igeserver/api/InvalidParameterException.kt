package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import org.springframework.http.HttpStatus

open class InvalidParameterException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "INVALID_PARAMETER"
        private const val ERROR_TEXT_INVALID = "One or more request parameters are missing or contain invalid values: \${parameterNames}."

        /**
         * Factory method for invalid parameters
         */
        fun withInvalidParameters(vararg parameterNames: String, cause: Throwable? = null) : InvalidParameterException {
            return InvalidParameterException(STATUS_CODE, ERROR_CODE, ERROR_TEXT_INVALID, mapOf("parameterNames" to parameterNames), cause)
        }
    }
}