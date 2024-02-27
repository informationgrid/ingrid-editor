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

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.*
import de.ingrid.utils.xml.XMLSerializer
import org.apache.logging.log4j.kotlin.logger
import java.io.IOException

class IBusIndexer(private val iBus: IBus): IIndexManager {
    val log = logger()
    
    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String? {
        val call = IngridCall()
        call.method = "getIndexNameFromAliasName"
        call.target = "__centralIndex__"
        val map: MutableMap<String, String> = HashMap()
        map["indexAlias"] = indexAlias
        map["partialName"] = partialName
        call.parameter = map

        val response = sendCallToIBus(iBus, call)
        return response?.getString("result")
    }

    override fun createIndex(name: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        val call = prepareCall("createIndex")
        val map: MutableMap<String, String> = HashMap()
        map["name"] = name
        map["type"] = type
        map["esMapping"] = esMapping
        map["esSettings"] = esSettings
        call.parameter = map

        val response = sendCallToIBus(iBus, call)
        return response != null && response.getBoolean("result")
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        val call = prepareCall("switchAlias")
        val map = mapOf(
            "aliasName" to aliasName,
            "oldIndex" to oldIndex,
            "newIndex" to newIndex
        )
        call.parameter = map

        sendCallToIBus(iBus, call)
    }

    override fun checkAndCreateInformationIndex() {
        val call = prepareCall("checkAndCreateInformationIndex")

        sendCallToIBus(iBus, call)
    }

    override fun getIndexTypeIdentifier(indexInfo: IndexInfo): String {
        return ("=>" + indexInfo.toIndex)// TODO: + ":" + indexInfo.toType
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument) {
        val call = prepareCall("update")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo // jacksonObjectMapper().convertValue(indexinfo, Any::class.java)
        map["doc"] = doc
        map["updateOldIndex"] = false
        call.parameter = map

        sendCallToIBus(iBus, call)
    }

    override fun updatePlugDescription(plugDescription: PlugDescription) {
        TODO("Not yet implemented")
    }

    override fun updateIPlugInformation(id: String, info: String) {
        val call = prepareCall("updateIPlugInformation")
        val map: MutableMap<String, Any> = HashMap()
        map["id"] = id
        map["info"] = info
        call.parameter = map

        sendCallToIBus(iBus, call)
    }

    override fun flush() {
        val call = prepareCall("flush")
        sendCallToIBus(iBus, call)
    }

    override fun deleteIndex(index: String) {
        val call = prepareCall("deleteIndex")
        call.parameter = index

        sendCallToIBus(iBus, call)
    }

    override fun getIndices(filter: String): Array<String> {
        val call = prepareCall("getIndices")
        call.parameter = filter

        val response = sendCallToIBus(iBus, call)
        return response?.get("result") as Array<String>? ?: emptyArray()
    }

    override fun getMapping(indexInfo: IndexInfo): Map<String, Any> {
        val call = prepareCall("getMapping")
        call.parameter = indexInfo

        val response = sendCallToIBus(iBus, call)
        return response!!["result"] as Map<String, Any>
    }

    override val defaultMapping: String?
        get() {
            val mappingStream = javaClass.classLoader.getResourceAsStream("default-mapping.json")
            try {
                if (mappingStream != null) {
                    return XMLSerializer.getContents(mappingStream)
                }
            } catch (e: IOException) {
                log.error("Error getting default mapping for index creation", e)
            }
            return null
        }

    override val defaultSettings: String?
        get() {
            val settingsStream = javaClass.classLoader.getResourceAsStream("default-settings.json")
            try {
                if (settingsStream != null) {
                    return XMLSerializer.getContents(settingsStream)
                }
            } catch (e: IOException) {
                log.error("Error getting default mapping for index creation", e)
            }
            return null
        }

    override fun updateHearbeatInformation(iPlugIdInfos: Map<String, String>) {
        TODO("Not yet implemented")
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        val call = prepareCall("deleteDocById")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo
        map["id"] = id
        map["updateOldIndex"] = updateOldIndex
        call.parameter = map

        sendCallToIBus(iBus, call)
    }

    override fun indexExists(indexName: String): Boolean {
        val call = prepareCall("indexExists")
        call.parameter = indexName

        val response = sendCallToIBus(iBus, call)
        return (if (response != null) response["result"] else false) as Boolean
    }

    private fun prepareCall(method: String): IngridCall {
        val call = IngridCall()
        call.target = "__centralIndex__"
        call.method = method
        return call
    }

    private fun sendCallToIBus(iBus: IBus, call: IngridCall): IngridDocument? {
        try {
            return iBus.call(call)
        } catch (e: Exception) {
            // TODO: log error for frontend!
            log.error("Error relaying index message: " + call.method, e)
            return null
        }
    }
}