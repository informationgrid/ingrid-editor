package de.ingrid.igeserver.services

import com.jillesvangurp.ktsearch.*
import de.ingrid.igeserver.index.ElasticClient
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import de.ingrid.utils.ElasticDocument
import kotlinx.serialization.KSerializer
import kotlinx.serialization.descriptors.SerialDescriptor
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import kotlin.time.Duration
import kotlin.time.Duration.Companion.seconds

class ESData : KSerializer<ElasticDocument> {
    override val descriptor: SerialDescriptor
        get() = TODO("Not yet implemented")

    override fun deserialize(decoder: Decoder): ElasticDocument {
        TODO("Not yet implemented")
    }

    override fun serialize(encoder: Encoder, value: ElasticDocument) {
        TODO("Not yet implemented")
    }
}

@Service
class ElasticsearchService(val settingsService: SettingsService) {

    val log = logger()

    private var clients: List<ElasticClient> = emptyList()

    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()
    
    fun setupConnections() {
        try {
            //          TODO:  if (!clients.isEmpty()) iBusClient?.shutdown()
            clients =
                settingsService.getElasticConfig().map {
                    val client = createElasticClient(it)
                    ElasticClient(
                        client,
                        client.bulkSession(timeout = 5.seconds, callBack = itemCallBack)
                    )
                }
            //            iBusClient = this.connectIBus()
        } catch (e: Exception) {
            log.error("Could not connect to Elasticsearch", e)
        }
    }

    private fun createElasticClient(config: ElasticConfig): SearchClient {
        return SearchClient(KtorRestClient(config.ip, config.port))
    }

    private val itemCallBack =
        object : BulkItemCallBack {
            override fun itemFailed(operationType: OperationType, item: BulkResponse.ItemDetails) {
                println(
                    """
      ${operationType.name} failed
      ${item.id} with ${item.status}
      """
                        .trimMargin()
                )
            }

            override fun itemOk(operationType: OperationType, item: BulkResponse.ItemDetails) {
                println(
                    """
      operation $operationType completed! 
      id: ${item.id}
      sq_no: ${item.seqNo} 
      primary_term ${item.primaryTerm}
    """
                        .trimIndent()
                )
            }

            override fun bulkRequestFailed(e: Exception, ops: List<Pair<String, String?>>) {
                println(
                    """
      Request failure ${e.message}.
      Unless you set 
    """
                        .trimIndent()
                )
            }
        }

    fun getClient(index: Int): ElasticClient {
        return clients[index]
    }

    fun isConnected(index: Int) {
        //        clients[index].client.repository("test2", KSerializer<ElasticDocument>)
    }
}
