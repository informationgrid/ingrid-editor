package de.ingrid.igeserver.services

import de.ingrid.ibus.client.BusClient
import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.igeserver.services.ibus.HeartBeatPlug
import de.ingrid.utils.*
import net.weta.components.communication.configuration.ClientConfiguration
import net.weta.components.communication.tcp.StartCommunication
import de.ingrid.utils.query.IngridQuery
import org.springframework.stereotype.Service
import java.io.File
import javax.annotation.PostConstruct

@Service
class IBusService: HeartBeatPlug(60000) {

    @PostConstruct
    fun init() {
        this.connectIBus()
        this.configure(getPlugDescription())
    }

    private fun getPlugDescription(): PlugDescription {

        val pd = PlugDescription()
        pd.addBusUrl("127.0.0.1:9900")
        pd.proxyServiceURL = "ige-ng"
        return pd

    }

    override fun call(p0: IngridCall?): IngridDocument {
        TODO("Not yet implemented")
    }

    override fun search(p0: IngridQuery?, p1: Int, p2: Int): IngridHits {
        TODO("Not yet implemented")
    }

    override fun getDetails(p0: Array<out IngridHit>?, p1: IngridQuery?, p2: Array<out String>?): Array<IngridHitDetail> {
        TODO("Not yet implemented")
    }

    override fun getDetail(p0: IngridHit?, p1: IngridQuery?, p2: Array<out String>?): IngridHitDetail {
        TODO("Not yet implemented")
    }

    private fun connectIBus(): BusClient? {
        val config = ClientConfiguration()
        config.name = "ige-ng"
        val connection = config.ClientConnection()
        connection.serverIp = "127.0.0.1"
        connection.serverPort = 9900
        connection.serverName = "/ingrid-group:ibus-test"
        config.addClientConnection(connection)
        val communication = StartCommunication.create(config)
        communication.startup()
        val busClient = BusClientFactory.createBusClient(communication)
        busClient.iPlug = this
        return busClient
    }

}