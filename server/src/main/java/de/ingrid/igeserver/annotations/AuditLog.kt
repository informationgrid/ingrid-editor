package de.ingrid.igeserver.annotations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.kotlin.logger
import org.aspectj.lang.ProceedingJoinPoint
import org.aspectj.lang.annotation.Around
import org.aspectj.lang.annotation.Aspect
import org.aspectj.lang.reflect.MethodSignature
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Target(AnnotationTarget.FUNCTION)
@Retention(AnnotationRetention.RUNTIME)
@Repeatable
annotation class AuditLog(val category: String, val logger: String)

@Aspect
@Component
class AuditLogAspect {
    companion object {
        private const val DEFAULT_LOGGER = "audit"

        private const val CATEGORY = "cat"
        private const val ACTOR = "actor"
        private const val ACTION = "action"
        private const val PARAMETERS = "params"
    }

    @Autowired
    private lateinit var userService: UserManagementService

    @Around("@annotation(AuditLog)")
    fun logExecution(joinPoint: ProceedingJoinPoint): Any? {
        val annotation = (joinPoint.signature as MethodSignature).method.getAnnotation(AuditLog::class.java)
        val log = if (annotation.logger.isNotBlank()) logger(annotation.logger) else logger(DEFAULT_LOGGER)

        // call target method
        val proceed = joinPoint.proceed()

        log.info(createLogMessage(annotation, joinPoint))
        return proceed
    }

    private fun createLogMessage(annotation: AuditLog, joinPoint: ProceedingJoinPoint): JsonNode {
        val parameters = jacksonObjectMapper().createObjectNode()
        val parameterNames = (joinPoint.signature as MethodSignature).parameterNames
        for (i in parameterNames.indices) {
            parameters.put(parameterNames[i], joinPoint.args[i]?.toString())
        }

        return jacksonObjectMapper().createObjectNode().apply {
            put(CATEGORY, annotation.category)
            put(ACTOR, userService.getCurrentPrincipal()?.name)
            put(ACTION, joinPoint.signature.declaringTypeName + "." + joinPoint.signature.name)
            replace(PARAMETERS, parameters)
        }
    }
}
