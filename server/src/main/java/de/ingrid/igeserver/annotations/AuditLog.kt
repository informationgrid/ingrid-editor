/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.annotations

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.services.AuditLogger
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
         * Action data (e.g. content of the document)
         */
        val data: String = "",

        /**
         * Log4j logger name to be used for logging (defaults to 'audit')
         */
        val logger: String = ""
)

@Aspect
@Component
class AuditLogAspect {

    @Autowired
    private lateinit var auditLogger: AuditLogger

    /**
     * Log a method execution with the @AuditLog annotation using AuditLogger

     * The fields will be set as follows:
     * - action: name of the annotated method (if action is not specified in the annotation)
     * - data: parameter names and values of the annotated method call, if 'data' parameter is not set or
     *         value of the parameter specified in 'data' (e.g. if data is 'document', the value of the 'document' method parameter
     *         will become the value of data)
     * - target: value of the parameter specified in 'target' (e.g. if target is 'id', the value of the 'id' method parameter
     *         will become the value of target)
     */
    @Around("@annotation(AuditLog)")
    fun logMethodExecution(joinPoint: ProceedingJoinPoint): Any? {
        val annotation = (joinPoint.signature as MethodSignature).method.getAnnotation(AuditLog::class.java)

        // call target method
        val proceed = joinPoint.proceed()

        // extract data from method call parameters
        val parameterNames = (joinPoint.signature as MethodSignature).parameterNames
        val parameters: JsonNode? = if (annotation.data.isBlank()) {
            val result = jacksonObjectMapper().createObjectNode()
            for (i in parameterNames.indices) {
                result.put(parameterNames[i], joinPoint.args[i]?.toString())
            }
            result
        }
        else {
            toJsonNode(getParameter(annotation.data, parameterNames, joinPoint))
        }

        // determine action, target, data
        val action = if (annotation.action.isNotBlank()) annotation.action else
            joinPoint.signature.declaringTypeName + "." + joinPoint.signature.name
        val target = if (annotation.target.isNotBlank()) getParameter(annotation.target, parameterNames, joinPoint)?.toString() else ""

        auditLogger.log(annotation.category, action, target, parameters, annotation.logger)
        return proceed
    }

    /**
     * Get a named parameter from the given joint point
     */
    private fun getParameter(name: String, parameterNames: Array<String>, joinPoint: ProceedingJoinPoint): Any? {
        val pos = parameterNames.indexOf(name)
        return if (pos >= 0) joinPoint.args[pos] else null
    }

    /**
     * Convert the argument to a json node
     */
    private fun toJsonNode(value: Any?): JsonNode? {
        if (value is JsonNode) return value
        if (value == null) return null

        val strValue = value.toString()
        return try {
            jacksonObjectMapper().readTree(strValue)
        }
        catch (ex: Exception) {
            jacksonObjectMapper().createObjectNode().apply {
                put("text", strValue)
            }
        }
    }
}
