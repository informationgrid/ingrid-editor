package de.ingrid.igeserver

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.apache.commons.text.StringSubstitutor
import org.springframework.http.HttpStatus
import java.util.*

/**
 * Base class for all exceptions visible to REST API clients
 */
open class IgeException(
        /**
         * The HTTP status code
         */
        val statusCode: HttpStatus,

        /**
         * The unique error code of the exception (e.g. ALREADY_EXISTS)
         * that can be used to identify the error cause in client applications
         */
        val errorCode: String,

        /**
         * A text describing the error which might be presented to the user
         * Variables of the form ${variable} will be replaced by the value of
         * the appropriate key if present in data
         */
        var errorText: String,

        /**
         * Optional data to be used to customize the error text
         */
        val data: Map<String, Any?>? = null,

        /**
         * Optional cause of the exception
         */
        cause: Throwable? = null

) : RuntimeException(getErrorText(errorText, data), cause) {
        /**
         * The unique id of the exception
         */
        val errorId: String = UUID.randomUUID().toString()

        init {
                errorText = super.getLocalizedMessage()
        }

        companion object {
                fun getErrorText(errorText: String, data: Map<String, Any?>?): String {
                        val serializedData = data?.mapValues { entry ->
                                jacksonObjectMapper().writeValueAsString(entry.value).replace("\"", "")
                        }
                        return if (data != null && data.isNotEmpty()) StringSubstitutor(serializedData).replace(errorText) else errorText
                }
        }
}