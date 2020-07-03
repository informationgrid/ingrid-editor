package de.ingrid.igeserver

import com.orientechnologies.orient.core.exception.OConcurrentModificationException
import de.ingrid.igeserver.api.ApiException
import org.apache.commons.lang3.NotImplementedException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import javax.naming.NoPermissionException

/**
 * This class handles all REST errors globally. There's no need to handle each error individually in each controller.
 */
@ControllerAdvice
class RestResponseEntityExceptionHandler : ResponseEntityExceptionHandler() {

    val log = logger()

    @ExceptionHandler(value = [NoPermissionException::class])
    protected fun handleNoPermissionErrors(ex: NoPermissionException, request: WebRequest): ResponseEntity<Any> {
        log.error("No Permission handled:", ex)
        val bodyOfResponse = ex.message
        return handleExceptionInternal(ex, bodyOfResponse, HttpHeaders(), HttpStatus.FORBIDDEN, request)
    }

    @ExceptionHandler(value = [IllegalArgumentException::class, IllegalStateException::class])
    protected fun handleConflict(ex: RuntimeException, request: WebRequest): ResponseEntity<Any> {
        log.error("Conflict happened:", ex)
        val bodyOfResponse = "This should be application specific"
        return handleExceptionInternal(ex, bodyOfResponse, HttpHeaders(), HttpStatus.CONFLICT, request)
    }

    @ExceptionHandler(value = [ApiException::class])
    protected fun handleApiExceptions(ex: ApiException, request: WebRequest): ResponseEntity<Any> {
        if (ex.isHideStacktrace) {
            log.error("ApiException happened: " + ex.message)
        } else {
            log.error("ApiException happened:", ex)
        }
        // String bodyOfResponse = ex.getMessage();
        val bodyOfResponse: Any = Error(ex.message)
        return handleExceptionInternal(ex, bodyOfResponse, HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request)
    }

    @ExceptionHandler(value = [Exception::class, NotImplementedException::class])
    protected fun handleOtherErrors(ex: RuntimeException, request: WebRequest): ResponseEntity<Any> {
        log.error("Exception happened:", ex)
        val bodyOfResponse = ex.message
        return handleExceptionInternal(ex, bodyOfResponse, HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request)
    }

    @ExceptionHandler(value = [OConcurrentModificationException::class])
    protected fun handleConcurrentModificationErrors(ex: RuntimeException, request: WebRequest): ResponseEntity<Any> {
        log.error("Concurrent update happened:", ex)
        val bodyOfResponse = ex.message
        return handleExceptionInternal(ex, bodyOfResponse, HttpHeaders(), HttpStatus.CONFLICT, request)
    }

}