/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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

import com.jillesvangurp.ktsearch.BulkItemCallBack
import com.jillesvangurp.ktsearch.BulkResponse
import com.jillesvangurp.ktsearch.KtorRestClient
import com.jillesvangurp.ktsearch.Node
import com.jillesvangurp.ktsearch.OperationType
import com.jillesvangurp.ktsearch.SearchClient
import com.jillesvangurp.ktsearch.bulkSession
import com.jillesvangurp.ktsearch.clusterHealth
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.index.ElasticClient
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import io.ktor.client.HttpClient
import io.ktor.client.engine.java.Java
import io.ktor.client.plugins.auth.Auth
import io.ktor.client.plugins.auth.providers.BasicAuthCredentials
import io.ktor.client.plugins.auth.providers.basic
import kotlinx.coroutines.runBlocking
import org.apache.http.ssl.SSLContexts
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service
import java.nio.file.Files
import java.nio.file.Paths
import java.security.KeyStore
import java.security.cert.Certificate
import java.security.cert.CertificateFactory
import javax.net.ssl.SSLContext
import kotlin.time.Duration.Companion.seconds

@Service
class ElasticsearchService(val settingsService: SettingsService) : IConnection {

    val log = logger()

    private var clients: List<ElasticClient> = emptyList()

    private var clientConfigMap: Map<String, Int> = emptyMap()

    @EventListener(ApplicationReadyEvent::class)
    fun init() = setupConnections()

    fun setupConnections() {
        try {
            //          TODO:  if (!clients.isEmpty()) iBusClient?.shutdown()
            val elasticConfig = settingsService.getElasticConfig()
            clients =
                elasticConfig.map {
                    val client = createElasticClient(it)
                    ElasticClient(
                        client,
                        client.bulkSession(timeout = 30.seconds, callBack = itemCallBack, closeOnRequestError = false),
                    )
                }
            clientConfigMap =
                elasticConfig.mapIndexed { index, config -> config.id!! to index }.toMap()
        } catch (e: Exception) {
            log.error("Could not connect to Elasticsearch", e)
        }
    }

    private fun createElasticClient(config: ElasticConfig): SearchClient {
        val sslContext: SSLContext? = getSslContext(config.https)

        return SearchClient(
            KtorRestClient(
                https = config.https == true,
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
                    engine {
                        config {
                            if (sslContext != null) sslContext(sslContext)
                        }
                    }
                },
                user = config.username,
                password = config.password,
                nodes = config.hosts.map
                    {
                        val (name, port) = it.split(":")
                        Node(name, port.toInt())
                    }.toTypedArray(),
            ),
        )
    }

    private fun getSslContext(https: Boolean?): SSLContext? {
        if (https != true) return null

        val caCertificatePath = Paths.get("elasticsearch-ca.pem")
        val factory = CertificateFactory.getInstance("X.509")
        val trustedCa: Certificate? = Files.newInputStream(caCertificatePath).let {
            factory.generateCertificate(it)
        }
        val trustStore = KeyStore.getInstance("pkcs12").apply {
            load(null, null)
            setCertificateEntry("ca", trustedCa)
        }
        return SSLContexts.custom()
            .loadTrustMaterial(trustStore, null)
            .build()
    }

    private val itemCallBack =
        object : BulkItemCallBack {
            override fun itemFailed(operationType: OperationType, item: BulkResponse.ItemDetails) {
                val msg =
                    "Bulk Item Request Failed: ${operationType.name} failed for ${item.id} in ${item.index} with status ${item.status}: ${item.error}"
                log.error(msg)
                throw ServerException.withReason(msg)
            }

            override fun itemOk(operationType: OperationType, item: BulkResponse.ItemDetails) {}

            override fun bulkRequestFailed(e: Exception, ops: List<Pair<String, String?>>) {
                log.error("Bulk Request Failed: ${e.message}")
                // throw exception again to prevent closing session and handle exception in our code
                throw e
            }
        }

    fun getClient(index: String): ElasticClient = clients[clientConfigMap[index]!!]

    override fun isConnected(id: String): Boolean = runBlocking {
        try {
            clients[clientConfigMap[id]!!].client.clusterHealth()
            true
        } catch (e: Exception) {
            log.warn("No connection to at least one Elasticsearch-Node: ${e.message}")
            false
        }
    }

    override fun containsId(id: String): Boolean = clientConfigMap[id] != null
}
