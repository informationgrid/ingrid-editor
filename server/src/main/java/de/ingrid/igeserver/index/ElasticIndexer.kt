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
package de.ingrid.igeserver.index
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.jillesvangurp.ktsearch.*
import com.jillesvangurp.searchdsls.querydsl.sort
import com.jillesvangurp.searchdsls.querydsl.term
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.ServerException
import de.ingrid.utils.ElasticDocument
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import java.io.IOException

data class ElasticClient(
    val client: SearchClient,
    val bulkProcessor: BulkSession
)

private const val metaIndex = "ingrid_meta"

/**
 * Utility class to manage elasticsearch indices and documents.
 * @author Andre
 */
class ElasticIndexer(private val elastic: ElasticClient): IIndexManager {
    private val log = logger()

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String? {
        return runBlocking {
            val aliases = elastic.client.getAliases(indexAlias)
            aliases.keys.find { partialName == null || it.contains(partialName) }
        }
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        return runBlocking {
            val response = elastic.client.createIndex(name, """
                { "mappings": $esMapping, "settings": $esSettings }
            """.trimIndent())
            response.acknowledged
        }
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        runBlocking { 
            elastic.client.updateAliases {
                if (oldIndex != null) {
                    remove {
                        alias = aliasName
                        index = oldIndex
                    }
                }
                add { 
                    alias = aliasName
                    index = newIndex
                }
            } 
        }
    }

    override fun checkAndCreateInformationIndex() {
        if (!indexExists(metaIndex)) {
            try {
                createIndex(metaIndex, "info", defaultMapping, defaultSettings)
            } catch (e: IOException) {
                log.error("Could not deserialize: ingrid-meta-mapping.json", e)
            }
        }
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument) {
        runBlocking {
            elastic.bulkProcessor.index(jacksonObjectMapper().convertValue(doc, JsonNode::class.java).toString(), indexinfo.getRealIndexName(), doc["uuid"].toString())
        }
    }

    override fun updateIPlugInformation(id: String, info: String) {
        runBlocking { 
            val response = elastic.client.search(metaIndex) {
                term("indexId", id)
                sort { 
                    add("lastIndexed")
                }
            }
            
            when (response.hits?.total?.value) {
                1L -> {
                    val docId = response.hits?.hits?.get(0)?.id
                    // add index request to queue to avoid sending of too many requests
                    elastic.bulkProcessor.index(info, metaIndex, docId)
                }
                0L -> {
                    // create document immediately so that it's available for further requests
                    elastic.client.indexDocument(metaIndex, info)
                }
                else -> {
                    log.warn("There is more than one iPlug information document in the index of: $id")
                    log.warn("Removing items and adding new one")
                    val searchHits = response.hits?.hits ?: emptyList()
                    // delete all hits except the first one
                    for (i in 1 until searchHits.size) {
                        elastic.bulkProcessor.delete(searchHits[i].id, metaIndex)
                    }
                    flush()

                    // add first hit, which we did not delete
                    elastic.bulkProcessor.index(info, metaIndex, searchHits[0].id)
                }
            }
        }
    }

    override fun flush() {
        runBlocking { 
            elastic.bulkProcessor.flush()
        }
    }

    override fun deleteIndex(index: String) {
        runBlocking { 
            elastic.client.deleteIndex(index)
        }
    }

    override fun getIndices(filter: String): List<String> {
        return runBlocking {
            elastic.client.getAliases().keys.filter { it.startsWith(filter)}
        }
    }

    override val defaultMapping: String = ElasticIndexer::class.java.getResource("ingrid-meta-mapping.json")?.readText() ?: throw ServerException.withReason("Could not find mapping file 'ingrid-meta-mapping.json' for creating index 'ingrid_meta'")
    override val defaultSettings: String = ElasticIndexer::class.java.getResource("ingrid-meta-settings.json")?.readText() ?: throw ServerException.withReason("Could not find mapping file 'ingrid-meta-settings.json' for creating index 'ingrid_meta'")

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        runBlocking { 
            elastic.bulkProcessor.delete(id, indexinfo.getRealIndexName())

            if (updateOldIndex) {
                val oldIndex: String? = getIndexNameFromAliasName(indexinfo.toAlias!!, null)
                if (oldIndex != null && oldIndex != indexinfo.getRealIndexName()) {
                    val otherIndexInfo: IndexInfo = indexinfo.copy()
                    otherIndexInfo.setRealIndexName(oldIndex)
                    delete(otherIndexInfo, id, false)
                }
            }
        }
    }

    override fun indexExists(indexName: String): Boolean {
        return runBlocking { elastic.client.exists(indexName) }
    }

} 
