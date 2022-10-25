/*-
 * **************************************************-
 * InGrid Base-Webapp
 * ==================================================
 * Copyright (C) 2014 - 2022 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.igeserver.services.ibus

import de.ingrid.elasticsearch.IBusIndexManager
import de.ingrid.elasticsearch.IIndexManager
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.services.CatalogService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.util.*

@Service
@Profile("elasticsearch & ibus")
class IPlugHeartbeatElasticsearch @Autowired constructor(
    indexManager: IndexManager?,
    ibusIndexManager: IBusIndexManager?,
    @Value("\${elastic.communication.ibus:true}") private val indexThroughIBus: Boolean,
    catalogService: CatalogService
) : TimerTask() {
    private lateinit var indexManager: IIndexManager
    private val timer: Timer
    private var docProducerIndices: List<String> = emptyList()

    init {
        if (indexThroughIBus) {
            this.indexManager = ibusIndexManager!!
        } else {
            this.indexManager = indexManager!!
        }
        val interval = 60
        timer = Timer(true)
        timer.schedule(this, 5000, interval * 1000L)
        docProducerIndices = catalogService.getCatalogs()
            .flatMap { listOf("ige-ng:${it.identifier}:data", "ige-ng:${it.identifier}:address") }

    }

    override fun run() {
        // heartbeats not supported
        /*try {
            indexManager.updateHearbeatInformation(getIPlugInfos(docProducerIndices))
            indexManager.flush()
        } catch (e: InterruptedException) {
            log.error("Error updating Heartbeat information.", e)
        } catch (e: ExecutionException) {
            log.error("Error updating Heartbeat information.", e)
        } catch (e: IOException) {
            log.error("Error updating Heartbeat information.", e)
        }*/
    }

    /*private fun getIPlugInfos(docProducerIndices: List<String>): Map<String, String?> {
        val map: MutableMap<String, String?> = HashMap()
        for (docProdId in docProducerIndices) {
            map[docProdId] = getHearbeatInfo(docProdId, "ige-ng_" + docProdId.split(":")[1])
        }
        return map
    }

    private fun getHearbeatInfo(id: String, plugId: String): String? {
        return try {
            val xContentBuilder = XContentFactory.jsonBuilder().startObject()
                .field("plugId", plugId)
                .field("indexId", id)
                .field("lastHeartbeat", Date())
                .endObject()
            Strings.toString(xContentBuilder)
        } catch (ex: IOException) {
            log.error("Error creating iPlug information", ex)
            null
        }
    }
    
     */

    /*companion object {
        private val log = LogManager.getLogger(
            IPlugHeartbeatElasticsearch::class.java
        )
    }*/
}
