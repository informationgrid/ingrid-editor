package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

open class ConfigurationException: ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "INVALID_CONFIG"
        private const val ERROR_TEXT_MISSING = "Value '\${valueName}' is missing or empty."

        /**
         * Factory method for missing configuration value
         */
        fun withMissingValue(valueName: String, cause: Throwable? = null) : ConfigurationException {
            return ConfigurationException(STATUS_CODE, ERROR_CODE, ERROR_TEXT_MISSING, mapOf("valueName" to valueName), cause)
        }

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null): ConfigurationException {
            return ConfigurationException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }
    }
}