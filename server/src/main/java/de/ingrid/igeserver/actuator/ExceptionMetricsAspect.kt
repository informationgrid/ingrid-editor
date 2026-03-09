/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.actuator

import io.micrometer.core.instrument.MeterRegistry
import org.aspectj.lang.annotation.AfterThrowing
import org.aspectj.lang.annotation.Aspect
import org.springframework.stereotype.Component
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Aspect
@Component
class ExceptionMetricsAspect(private val registry: MeterRegistry) {

    private val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    private val lastOccurrences = java.util.concurrent.ConcurrentHashMap<String, String>()

    // Catch and count all exceptions in the application
    @AfterThrowing(
        pointcut = "within(@org.springframework.web.bind.annotation.RestController *)",
        throwing = "ex",
    )
    fun monitorException(ex: Throwable) {
        val now = LocalDateTime.now().format(formatter)
        val exceptionId = "${ex.javaClass.simpleName}: ${ex.message}"
        lastOccurrences[exceptionId] = now

        // Metrik erhöhen
        registry.counter(
            "app.errors",
            "type",
            exceptionId,
        ).increment()
    }
}
