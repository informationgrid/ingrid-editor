package de.ingrid.igeserver.annotations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.TextNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.UserManagementService
import org.apache.logging.log4j.kotlin.KotlinLogger
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
annotation class AuditLog(
        /**
         * Log category (e.g. persistence)
         */
        val category: String = "",

        /**
         * Executed action (e.g. update)
         */
        val action: String = "",

        /**
         * Action target (e.g. id of the document)
         */
        val target: String = "",

        /**
         * Log4j logger name to be used for logging (defaults to 'audit')
         */
        val logger: String = ""
)

@Aspect
@Component
class AuditLogger {
    companion object {
        private const val DEFAULT_LOGGER = "audit"

        private const val CATEGORY = "cat"
        private const val ACTION = "action"
        private const val TARGET = "target"
        private const val TIME = "time"
        private const val ACTOR = "actor"
        private const val DATA = "data"
    }

    @Autowired
    private lateinit var dateService: DateService

    @Autowired
    private lateinit var userService: UserManagementService

    /**
     * Log an audit message with the given data
     */
    fun log(category: String, action: String, target: String, data: JsonNode? = null, logger: String? = null) {
        getLogger(logger).info(createLogMessage(category, action, target, data))
    }

    /**
     * Log a method execution with the @AuditLog annotation
     * The fields will be set as follows:
     * - action: name of the annotated method (if action is not specified in the annotation)
     * - data: parameter names and values of the annotated method call
     * - target: value of the parameter specified in 'target' (e.g. if target is 'id', the value of the 'id' method parameter
     *           will become the value of target)
     */
    @Around("@annotation(AuditLog)")
    fun logMethodExecution(joinPoint: ProceedingJoinPoint): Any? {
        val annotation = (joinPoint.signature as MethodSignature).method.getAnnotation(AuditLog::class.java)

        // call target method
        val proceed = joinPoint.proceed()

        // extract data from method call parameters
        val parameters = jacksonObjectMapper().createObjectNode()
        val parameterNames = (joinPoint.signature as MethodSignature).parameterNames
        for (i in parameterNames.indices) {
            parameters.put(parameterNames[i], joinPoint.args[i]?.toString())
        }

        // determine action and target
        val action = if (annotation.action.isNotBlank()) annotation.action else
            joinPoint.signature.declaringTypeName + "." + joinPoint.signature.name
        val target = if (annotation.target.isNotBlank() &&
                parameters.hasNonNull(annotation.target)) (parameters[annotation.target] as TextNode).asText() else
            ""

        getLogger(annotation.logger).info(createLogMessage(annotation.category, action, target, parameters))
        return proceed
    }

    private fun getLogger(name: String?): KotlinLogger {
        return if (!name.isNullOrBlank()) logger(name) else logger(DEFAULT_LOGGER)
    }

    private fun createLogMessage(category: String, action: String, target: String, data: JsonNode?): JsonNode {
        return jacksonObjectMapper().createObjectNode().apply {
            put(CATEGORY, category)
            put(ACTION, action)
            put(TARGET, target)
            put(TIME, dateService.now().toString())
            put(ACTOR, userService.getCurrentPrincipal()?.name)
            replace(DATA, data)
        }
    }
}
