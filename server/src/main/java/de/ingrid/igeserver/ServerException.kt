package de.ingrid.igeserver

/**
 * Base class for exceptions that occur while processing a valid request to the REST API
 */
open class ServerException(
        statusCode: Int,
        errorCode: String,
        errorText: String,
        data: Map<String, Any>? = null,
        cause: Throwable? = null
) : IgeException(statusCode, errorCode, errorText, data, cause) {
    /**
     * Constructor without status code
     */
    constructor(errorCode: String, errorText: String, data: Map<String, Any>? = null, cause: Throwable? = null) :
            this(STATUS_CODE, errorCode, errorText, data, cause)

    /**
     * Constructor with optional cause only
     */
    constructor(cause: Throwable? = null) : this(STATUS_CODE, ERROR_CODE,
            if (cause != null && !cause.message.isNullOrBlank()) cause.message!! else ERROR_TEXT, null, cause)

    companion object {
        private const val STATUS_CODE = 500
        private const val ERROR_CODE = "INTERNAL_ERROR"
        private const val ERROR_TEXT = "The operation has failed, but detailed information is not available."
    }
}