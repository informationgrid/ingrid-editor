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

import de.ingrid.igeserver.services.ConnectionService
import de.ingrid.igeserver.services.SettingsService
import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.HealthIndicator
import org.springframework.stereotype.Component

@Component
class ConnectionsHealthIndicator(
    private val settingsService: SettingsService,
    private val connectionService: ConnectionService,
) : HealthIndicator {

    override fun health(): Health {
        val details = mutableMapOf<String, Any>()
        var allUp = true

        val ibusConfigs = settingsService.getIBusConfig()
        ibusConfigs.forEach { config ->
            val id = config.id ?: return@forEach
            val connected = connectionService.isConnected(id)
            details["iBus_${config.name}"] = if (connected) "UP" else "DOWN"
            if (!connected) allUp = false
        }

        val elasticConfigs = settingsService.getElasticConfig()
        elasticConfigs.forEach { config ->
            val id = config.id ?: return@forEach
            val connected = connectionService.isConnected(id)
            details["Elastic_${config.name}"] = if (connected) "UP" else "DOWN"
            if (!connected) allUp = false
        }

        val cswtConfigs = settingsService.getCSWTConfig()
        cswtConfigs.forEach { config ->
            val id = config.id ?: return@forEach
            val connected = connectionService.isConnected(id)
            details["CSWT_${config.name}"] = if (connected) "UP" else "DOWN"
            if (!connected) allUp = false
        }

        return if (allUp) {
            Health.up().withDetails(details).build()
        } else {
            Health.down().withDetails(details).build()
        }
    }
}
