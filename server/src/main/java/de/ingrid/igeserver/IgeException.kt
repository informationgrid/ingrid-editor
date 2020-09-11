package de.ingrid.igeserver

import org.apache.commons.lang.text.StrSubstitutor

/**
 * Base class for all exceptions visible to REST API clients
 */
open class IgeException(
        /**
         * The HTTP status code
         */
        private val statusCode: Int,

        /**
         * The unique error code of the exception (e.g. ALREADY_EXISTS)
         * that can be used to identify the error cause in client applications
         */
        private val errorCode: String,

        /**
         * A text describing the error which might be presented to the user
         * Variables of the form ${variable} will be replaced by the value of
         * the appropriate key if present in data
         */
        private var errorText: String,

        /**
         * Optional data to be used to customize the error text
         */
        private val data: Map<String, Any>? = null,

        /**
         * Optional cause of the exception
         */
        cause: Throwable? = null

) : RuntimeException(if (data != null && data.isNotEmpty()) StrSubstitutor(data).replace(errorText) else errorText, cause)