package de.ingrid.igeserver.services

import de.ingrid.ibus.client.BusClient
import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.services.ibus.HeartBeatPlug
import de.ingrid.utils.*
import de.ingrid.utils.query.IngridQuery
import jakarta.annotation.PostConstruct
import net.weta.components.communication.configuration.ClientConfiguration
import net.weta.components.communication.tcp.StartCommunication
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ibus & elasticsearch")
class IBusService @Autowired constructor(val settingsService: SettingsService, val appProperties: GeneralProperties) : HeartBeatPlug(60000) {

    val log = logger()

    private var iBusClient: BusClient? = null

    @PostConstruct
    fun init() = setupConnections()

    fun setupConnections() {
        try {
//            val iBusUrls = settingsService.getIBusConfig().map { "${it.ip}:${it.port}" }
            iBusClient = this.connectIBus(settingsService.getIBusConfig())
//            this.configure(getPlugDescription(iBusUrls))
        } catch (e: Exception) {
            log.error("Could not connect to iBus", e)
        }
    }

    fun restartCommunication() {
        iBusClient?.shutdown()
        val clientConfig = createClientConfiguration(settingsService.getIBusConfig())
        iBusClient?.start(clientConfig)
        val communication = StartCommunication.create(clientConfig)
        BusClientFactory.createBusClientOverride(communication)
    }

    private fun getPlugDescription(urls: List<String>): PlugDescription {

        // partner and provider will be written during indexing
        return settingsService.getPlugDescription("", "", "unknown", false).apply {
            urls.forEach { addBusUrl(it) }
        }

    }

    override fun call(p0: IngridCall?): IngridDocument {
        TODO("Not yet implemented")
    }

    override fun search(p0: IngridQuery?, p1: Int, p2: Int): IngridHits {
        TODO("Not yet implemented")
    }

    override fun getDetails(
        p0: Array<out IngridHit>?,
        p1: IngridQuery?,
        p2: Array<out String>?
    ): Array<IngridHitDetail> {
        TODO("Not yet implemented")
    }

    override fun getDetail(p0: IngridHit?, p1: IngridQuery?, p2: Array<out String>?): IngridHitDetail {
        TODO("Not yet implemented")
    }

    private fun connectIBus(configs: List<IBusConfig>): BusClient {
        val config = createClientConfiguration(configs)
        val communication = StartCommunication.create(config)
        communication.startup()
        val busClient = BusClientFactory.createBusClient(communication)
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
                    serverName = it.url
                }
                addClientConnection(connection)
            }
        }
        return config
    }

}
