/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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

import de.ingrid.codelists.CodeListService
import org.springframework.boot.actuate.health.Health
import org.springframework.boot.actuate.health.HealthIndicator
import org.springframework.stereotype.Component

@Component
class CodeListRepoHealthIndicator(private val codeListService: CodeListService) : HealthIndicator {

    override fun health(): Health = try {
        val codelists = codeListService.updateFromServer()
        if (codelists != null) {
            Health.up().withDetail("message", "Connection to codelist-repository is working.").build()
        } else {
            Health.down().withDetail("message", "Failed to fetch codelists from repository.").build()
        }
    } catch (e: Exception) {
        Health.down()
            .withDetail("message", "Error connecting to codelist-repository: ${e.message}")
            .withException(e)
            .build()
    }
}
