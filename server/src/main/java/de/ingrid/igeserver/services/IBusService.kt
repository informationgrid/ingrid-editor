/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import de.ingrid.ibus.client.BusClient
import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.utils.*
import de.ingrid.utils.query.IngridQuery
import net.weta.components.communication.configuration.ClientConfiguration
import net.weta.components.communication.tcp.StartCommunication
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.annotation.Profile
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
//@Profile("ibus & elasticsearch")
class IBusService(val settingsService: SettingsService, val appProperties: GeneralProperties): IPlug {

    val log = logger()

    private var iBusClient: BusClient? = null

    // this ensures that the service is started after the migration tasks
    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()

    fun setupConnections() {
        try {
            if (iBusClient?.nonCacheableIBusses?.isEmpty() == false) iBusClient?.shutdown()
            val iBusConfig = settingsService.getIBusConfig()
            if (iBusConfig.isNotEmpty()) iBusClient = this.connectIBus(iBusConfig)
        } catch (e: Exception) {
            log.error("Could not connect to iBus", e)
        }
    }
    
    fun getIBus(index: Int): IBus {
        return iBusClient?.nonCacheableIBusses?.get(index) ?: throw ServerException.withReason("iBus with index $index not found. There are ${iBusClient?.cacheableIBusses?.size} iBusses registered.")
    }
    
    fun isConnected(iBusIndex: Int): Boolean {
        return try {
            iBusClient?.nonCacheableIBusses?.get(iBusIndex)?.metadata != null
        } catch (e: Exception) {
            false
        }
    }

    private fun connectIBus(configs: List<IBusConfig>): BusClient {
        val config = createClientConfiguration(configs)
        val communication = StartCommunication.create(config)
        communication.startup()
        val busClient = BusClientFactory.createBusClientOverride(communication)
        busClient.iPlug = this
        return busClient
    }

    private fun createClientConfiguration(configs: List<IBusConfig>): ClientConfiguration {
        val config = ClientConfiguration().apply {
            name = appProperties.instanceId
            configs.forEach {
                val connection = ClientConnection().apply {
                    serverIp = it.ip
                    serverPort = it.port
                    serverName = it.name
                }
                addClientConnection(connection)
            }
        }
        return config
    }

    override fun search(p0: IngridQuery?, p1: Int, p2: Int): IngridHits {
        TODO("Not yet implemented")
    }

    override fun getDetail(p0: IngridHit?, p1: IngridQuery?, p2: Array<out String>?): IngridHitDetail {
        TODO("Not yet implemented")
    }

    override fun getDetails(
        p0: Array<out IngridHit>?,
        p1: IngridQuery?,
        p2: Array<out String>?
    ): Array<IngridHitDetail> {
        TODO("Not yet implemented")
    }

    override fun close() {
        TODO("Not yet implemented")
    }

    override fun call(p0: IngridCall?): IngridDocument {
        TODO("Not yet implemented")
    }

    override fun configure(p0: PlugDescription?) {
        TODO("Not yet implemented")
    }

}
