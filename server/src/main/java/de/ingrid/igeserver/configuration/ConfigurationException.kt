package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.ServerException

open class ConfigurationException(errorText: String, data: Map<String, Any>? = null) :
        ServerException(ERROR_CODE, errorText, data) {
    constructor(configName: String) : this(ERROR_TEXT_MISSING, mapOf("configName" to configName))

    companion object {
        private const val ERROR_CODE = "INVALID_CONFIG"
        private const val ERROR_TEXT_MISSING = "Value '\${valueName}' is missing or empty."

        /**
         * Factory method for missing configuration value
         */
        fun fromMissingValue(valueName: String) : ConfigurationException {
            return ConfigurationException(ERROR_TEXT_MISSING, mapOf("valueName" to valueName))
        }
    }
}