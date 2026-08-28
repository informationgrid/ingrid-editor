/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver

import com.fasterxml.jackson.annotation.JsonInclude
import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.api.InvalidParameterException
import org.apache.logging.log4j.kotlin.logger
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
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper

/**
 * This class handles all REST errors globally. There's no need to handle each error individually in each controller.
 */
@ControllerAdvice
class RestResponseEntityExceptionHandler : ResponseEntityExceptionHandler() {

    val log = logger()

    private val mapper: ObjectMapper by lazy {
        JsonMapper.builder()
            .changeDefaultPropertyInclusion { it.withValueInclusion(JsonInclude.Include.NON_NULL) }
            .build()
    }

    /**
     * Handler for application-specific exceptions
     */
    @ExceptionHandler(value = [IgeException::class])
    private fun handleIgeException(ex: IgeException, request: WebRequest): ResponseEntity<Any> {
        val data = mapper.writeValueAsString(
            mapOf(
                "errorId" to ex.errorId,
                "errorCode" to ex.errorCode,
                "errorText" to ex.errorText + " (Error-ID: ${ex.errorId})",
                "stacktrace" to null,
                "data" to ex.data,
            ),
        )
        val servletRequest = (request as ServletWebRequest).request
        val logMessage = "Exception $data was thrown while processing the request '${servletRequest.method} ${servletRequest.requestURI}'"
        if (ex is ServerException) {
            log.error(logMessage, ex)
        } else {
            log.debug(logMessage, ex)
        }
        return handleExceptionInternal(ex, data, HttpHeaders(), ex.statusCode, request)
    }

    /**
     * Handler for authorization exceptions
     */
    @ExceptionHandler(value = [AccessDeniedException::class])
    private fun handleAuthorizationException(t: Throwable, request: WebRequest): ResponseEntity<Any> {
        // wrap into server exception
        val igeException = ForbiddenException.withAccessRights(t.localizedMessage)
        return handleIgeException(igeException, request)
    }

    /**
     * Handler for unhandled exceptions
     */
    @ExceptionHandler(value = [Exception::class])
    private fun handleUnhandledException(t: Throwable, request: WebRequest): ResponseEntity<Any> {
        // wrap into server exception
        val igeException = UnhandledException.withCause(t)
        return handleIgeException(igeException, request)
    }

    /**
     * Overrides for exceptions that can be converted to application-specific exceptions
     */
    override fun handleMissingServletRequestParameter(
        ex: MissingServletRequestParameterException,
        headers: HttpHeaders,
        status: HttpStatusCode,
        request: WebRequest,
    ): ResponseEntity<Any>? {
        val igeException = InvalidParameterException.withInvalidParameters(ex.parameterName)
        return handleIgeException(igeException, request)
    }

    /**
     * Override of parent handler for adding error body content
     */
    override fun handleExceptionInternal(
        ex: java.lang.Exception,
        @Nullable body: Any?,
        headers: HttpHeaders,
        status: HttpStatusCode,
        request: WebRequest,
    ): ResponseEntity<Any> = if (ex !is IgeException) {
        // wrap into server exception
        val httpStatus = HttpStatus.valueOf(status.value())
        val igeException = IgeException(httpStatus, httpStatus.name, httpStatus.reasonPhrase, null, ex)
        handleIgeException(igeException, request)
    } else {
        ResponseEntity(body, headers, status)
    }
}
