package de.ingrid.igeserver.services

import de.ingrid.ibus.client.BusClient
import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.services.ibus.HeartBeatPlug
import de.ingrid.utils.*
import net.weta.components.communication.configuration.ClientConfiguration
import net.weta.components.communication.tcp.StartCommunication
import de.ingrid.utils.query.IngridQuery
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Service
@Profile("ibus & elasticsearch")
class IBusService @Autowired constructor(val settingsService: SettingsService) : HeartBeatPlug(60000) {

    @PostConstruct
    fun init() {
        val iBusUrls = settingsService.getIBusConfig().map { "${it.ip}:${it.port}" }
        settingsService.getIBusConfig().forEach { this.connectIBus(it) }
        this.configure(getPlugDescription(iBusUrls))
    }

    private fun getPlugDescription(urls: List<String>): PlugDescription {

        return settingsService.getPlugDescription().apply {
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

    private fun connectIBus(parameter: IBusConfig): BusClient? {
        val config = ClientConfiguration().apply {
            name = "ige-ng"
            val connection = ClientConnection().apply {
                serverIp = parameter.ip
                serverPort = parameter.port
                serverName = parameter.url
            }
            addClientConnection(connection)
        }
        val communication = StartCommunication.create(config)
        communication.startup()
        val busClient = BusClientFactory.createBusClient(communication)
        busClient.iPlug = this
        return busClient
    }

}
