package de.ingrid.igeserver

/**
 * Base class for exceptions that are caused by invalid request to the REST API
 */
open class ClientException(
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
        private const val STATUS_CODE = 400
        private const val ERROR_CODE = "INVALID_REQUEST"
        private const val ERROR_TEXT = "The request was invalid, but detailed information is not available."
    }
}