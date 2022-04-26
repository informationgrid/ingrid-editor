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
@Profile("ibus")
class IBusService @Autowired constructor(val settingsService: SettingsService) : HeartBeatPlug(60000) {

    private var indexThroughIBus: Boolean = true

    @PostConstruct
    fun init() {
        settingsService.getIBusConfig().forEach { config ->
            this.connectIBus(config)
            this.configure(getPlugDescription(config))
        }
    }

    private fun getPlugDescription(config: IBusConfig): PlugDescription {

        val pd = PlugDescription()
        pd.addBusUrl("${config.ip}:${config.port}")
        pd.put("useRemoteElasticsearch", indexThroughIBus)
        pd.dataSourceName = "IGE-NG"
        pd.proxyServiceURL = config.url
        return pd

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
            val connection = ClientConnection()
            connection.serverIp = parameter.ip
            connection.serverPort = parameter.port
            connection.serverName = parameter.url
            addClientConnection(connection)
        }
        val communication = StartCommunication.create(config)
        communication.startup()
        val busClient = BusClientFactory.createBusClient(communication)
        busClient.iPlug = this
        return busClient
    }

}
