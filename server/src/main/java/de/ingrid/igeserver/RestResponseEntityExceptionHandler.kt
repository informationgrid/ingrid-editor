package de.ingrid.igeserver

import de.ingrid.igeserver.api.InvalidParameterException
import org.apache.commons.lang.exception.ExceptionUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.lang.Nullable
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.ServletWebRequest
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

/**
 * This class handles all REST errors globally. There's no need to handle each error individually in each controller.
 */
@ControllerAdvice
class RestResponseEntityExceptionHandler: ResponseEntityExceptionHandler() {

    val log = logger()

    /**
     * Handler for application specific exceptions
     */
    @ExceptionHandler(value = [IgeException::class])
    protected fun handleIgeException(ex: IgeException, request: WebRequest): ResponseEntity<Any> {
        val stacktraceOutput = if (ex is UnhandledException) ExceptionUtils.getFullStackTrace(ex.cause) else null
        val data = mapOf(
                "ErrorId" to ex.errorId,
                "ErrorCode" to ex.errorCode,
                "ErrorText" to ex.errorText,
                "Data" to ex.data,
                "Stacktrace" to stacktraceOutput
        ).filterValues { it != null }
        val servletRequest = (request as ServletWebRequest).request
        val logMessage = "Exception $data was thrown while processing the request '${servletRequest.method} ${servletRequest.requestURI}'"
        if (ex is ServerException) {
            log.error(logMessage, ex)
        }
        else {
            log.debug(logMessage, ex)
        }
        return handleExceptionInternal(ex, data, HttpHeaders(), ex.statusCode, request)
    }

    /**
     * Handler for unhandled exceptions
     */
    @ExceptionHandler(value = [Exception::class])
    protected fun handleUnhandledException(t: Throwable, request: WebRequest): ResponseEntity<Any> {
        // wrap into server exception
        val igeException = UnhandledException.withCause(t)
        return handleIgeException(igeException, request)
    }

    /**
     * Overrides for exceptions that can be converted to application specific exceptions
     */
    override fun handleMissingServletRequestParameter(
            ex: MissingServletRequestParameterException, headers: HttpHeaders, status: HttpStatus, request: WebRequest): ResponseEntity<Any> {
        val igeException = InvalidParameterException.withInvalidParameters(ex.parameterName)
        return handleIgeException(igeException, request)
    }

    /**
     * Override of parent handler for adding error body content
     */
    override fun handleExceptionInternal(
            ex: java.lang.Exception, @Nullable body: Any?, headers: HttpHeaders, status: HttpStatus, request: WebRequest): ResponseEntity<Any> {
        return if (ex !is IgeException) {
            // wrap into server exception
            val igeException = IgeException(status, status.name, status.reasonPhrase, null, ex)
            handleIgeException(igeException, request)
        }
        else {
            ResponseEntity(body, headers, status)
        }
    }
}