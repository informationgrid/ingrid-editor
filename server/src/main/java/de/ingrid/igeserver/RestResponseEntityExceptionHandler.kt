package de.ingrid.igeserver

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.api.InvalidParameterException
import org.apache.commons.lang3.exception.ExceptionUtils
import org.apache.logging.log4j.LogManager
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.lang.Nullable
import org.springframework.security.access.AccessDeniedException
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

    companion object {
        private val log = LogManager.getLogger()
    }

    private val mapper: ObjectMapper by lazy {
        val mapper = ObjectMapper()
        mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
        mapper
    }

    /**
     * Handler for application specific exceptions
     */
    @ExceptionHandler(value = [IgeException::class])
    protected fun handleIgeException(ex: IgeException, request: WebRequest): ResponseEntity<Any> {
        val stacktraceOutput = if (ex is UnhandledException) ExceptionUtils.getRootCauseStackTrace(ex.cause) else null
        val data = mapper.writeValueAsString(mapOf(
                "errorId" to ex.errorId,
                "errorCode" to ex.errorCode,
                "errorText" to ex.errorText,
                "data" to ex.data,
                "stacktrace" to stacktraceOutput
        ))
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
     * Handler for authorization exceptions
     */
    @ExceptionHandler(value = [AccessDeniedException::class])
    protected fun handleAuthorizationException(t: Throwable, request: WebRequest): ResponseEntity<Any> {
        // wrap into server exception
        val igeException = ForbiddenException.withAccessRights(t.localizedMessage)
        return handleIgeException(igeException, request)
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
        ex: MissingServletRequestParameterException, headers: HttpHeaders, status: HttpStatusCode, request: WebRequest): ResponseEntity<Any>? {
        val igeException = InvalidParameterException.withInvalidParameters(ex.parameterName)
        return handleIgeException(igeException, request)
    }

    /**
     * Override of parent handler for adding error body content
     */
    override fun handleExceptionInternal(
            ex: java.lang.Exception, @Nullable body: Any?, headers: HttpHeaders, status: HttpStatusCode, request: WebRequest): ResponseEntity<Any> {
        return if (ex !is IgeException) {
            // wrap into server exception
            val httpStatus = HttpStatus.valueOf(status.value())
            val igeException = IgeException(httpStatus, httpStatus.name, httpStatus.reasonPhrase, null, ex)
            handleIgeException(igeException, request)
        }
        else {
            ResponseEntity(body, headers, status)
        }
    }
}