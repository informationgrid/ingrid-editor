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
package de.ingrid.igeserver.services.connection

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DirectusConfig
import de.ingrid.igeserver.services.SettingsService
import de.ingrid.igeserver.services.directus.DirectusClient
import io.ktor.client.HttpClient
import io.ktor.client.engine.java.Java
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

/**
 * Connection to the "Directus Push-Schnittstelle" (UmweltNAVI Ingest API).
 */
@Service
class DirectusService(val settingsService: SettingsService) : IConnection {

    val log = logger()

    private var clientMap: Map<String, DirectusClient> = emptyMap()

    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()

    fun setupConnections() {
        try {
            val directusConfig = settingsService.getDirectusConfig()
            clientMap = directusConfig.associate { it.id!! to createDirectusClient(it) }
        } catch (e: Exception) {
            log.error("Could not setup Directus Push-Schnittstelle", e)
            clientMap = emptyMap()
        }
    }

    private fun createDirectusClient(config: DirectusConfig): DirectusClient = DirectusClient(
        client = HttpClient(Java),
        url = config.url,
        name = config.name,
        catalogId = config.catalogId,
        apiKey = config.apiKey,
    )

    fun getClient(id: String): DirectusClient {
        clientMap[id]?.let { return it }

        // try to setup connections again
        setupConnections()

        return clientMap[id]
            ?: throw ServerException.withReason("No Directus-Client found. Please check the connection.")
    }

    override fun isConnected(id: String): Boolean = try {
        clientMap[id]!!.getVersion()
        true
    } catch (e: Exception) {
        log.warn("No connection to Directus Push-Schnittstelle '$id': ${e.message}")
        false
    }

    override fun containsId(id: String): Boolean = clientMap[id] != null
}
