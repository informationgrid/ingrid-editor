/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services.connection

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CSWConfig
import de.ingrid.igeserver.services.SettingsService
import de.ingrid.igeserver.services.csw.CSWClient
import io.ktor.client.HttpClient
import io.ktor.client.engine.java.Java
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import io.ktor.client.request.request
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class CSWService(val settingsService: SettingsService) : IConnection {

    val log = logger()

    private var clientMap: Map<String, CSWClient> = emptyMap()

    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()

    fun setupConnections() {
        try {
            val cswtServiceConfig = settingsService.getCSWTConfig()
            clientMap =
                cswtServiceConfig.associate { it.id!! to createCSWTClient(it) }
        } catch (e: Exception) {
            log.error("Could not connect to CSW-interface", e)
            clientMap = emptyMap()
        }
    }

    private fun createCSWTClient(config: CSWConfig): CSWClient = CSWClient(
        client = HttpClient(Java) {
            if (config.username != null && config.password != null) {
                install(Auth) {
                    basic {
                        sendWithoutRequest { true }
                        credentials {
                            BasicAuthCredentials(username = config.username, password = config.password)
                        }
                    }
                }
            }
        },
        config.url,
        config.name,
    )

    fun getClient(index: String): CSWClient = clientMap[index]!!

    override fun isConnected(id: String): Boolean = runBlocking {
        try {
            clientMap[id]!!.getClient().request(clientMap[id]!!.getUrl())
            true
        } catch (e: Exception) {
            log.warn("No connection to CSW Service '$id': ${e.message}")
            false
        }
    }

    override fun containsId(id: String): Boolean = clientMap[id] != null
}
