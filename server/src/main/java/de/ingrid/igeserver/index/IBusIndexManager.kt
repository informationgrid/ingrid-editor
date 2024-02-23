package de.ingrid.igeserver.index
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.ibus.client.BusClientFactory
import de.ingrid.utils.*
import de.ingrid.utils.query.IngridQuery
import de.ingrid.utils.xml.XMLSerializer
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.Logger
import org.springframework.stereotype.Service
import java.io.IOException
import java.util.concurrent.ExecutionException


@Service
class IBusIndexManager: IConfigurable, IIndexManager {
    private var iBusses: List<IBus>? = null

    override fun configure(plugDescription: PlugDescription) {
        val busClient = BusClientFactory.getBusClient()
        iBusses = busClient.nonCacheableIBusses
    }

    private fun getIBusses(): List<IBus>? {
        if (iBusses == null) {
            val busClient = BusClientFactory.getBusClient()
            iBusses = busClient.nonCacheableIBusses
        }
        return iBusses
    }

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String? {
        val call = IngridCall()
        call.method = "getIndexNameFromAliasName"
        call.target = "__centralIndex__"
        val map: MutableMap<String, String> = mutableMapOf()
        map["indexAlias"] = indexAlias
        map["partialName"] = partialName
        call.parameter = map

        val response = sendCallToIBusses(call)
        return response?.getString("result")
    }

    fun getIndexNameFromAliasName(iBusIndex: Int, indexAlias: String, partialName: String): String? {
        val call = IngridCall()
        call.method = "getIndexNameFromAliasName"
        call.target = "__centralIndex__"
        val map: MutableMap<String, String> = HashMap()
        map["indexAlias"] = indexAlias
        map["partialName"] = partialName
        call.parameter = map

        val response = sendCallToIBus(iBusses!![iBusIndex], call)
        return response?.getString("result")
    }

    override fun createIndex(name: String): Boolean {
        val call = prepareCall("createIndex")
        val map: MutableMap<String, String> = HashMap()
        val mappingStream = javaClass.classLoader.getResourceAsStream("default-mapping.json")
            ?: throw RuntimeException("default-mapping.json file was not found when creating index")

        map["name"] = name
        try {
            map["mapping"] = XMLSerializer.getContents(mappingStream)
        } catch (e1: IOException) {
            log.error("Error converting stream to string", e1)
            return false
        }

        call.parameter = map

        val response = sendCallToIBusses(call)
        return response!!.getBoolean("result")
    }

    fun createIndex(iBusIndex: Int, name: String, type: String, esMapping: String, esSettings: String): Boolean {
        val call = prepareCall("createIndex")
        val map: MutableMap<String, String> = HashMap()
        map["name"] = name
        map["type"] = type
        map["esMapping"] = esMapping
        map["esSettings"] = esSettings
        call.parameter = map

        val response = sendCallToIBus(iBusses!![iBusIndex], call)
        return response != null && response.getBoolean("result")
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        val call = prepareCall("createIndex")
        val map: MutableMap<String, String> = HashMap()
        map["name"] = name
        map["type"] = type
        map["esMapping"] = esMapping
        map["esSettings"] = esSettings
        call.parameter = map

        val response = sendCallToIBusses(call)
        return response!!.getBoolean("result")
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        val call = prepareCall("switchAlias")
        val map: MutableMap<String, String?> = HashMap()
        map["aliasName"] = aliasName
        map["oldIndex"] = oldIndex
        map["newIndex"] = newIndex
        call.parameter = map

        sendCallToIBusses(call)
    }

    fun switchAlias(iBusIndex: Int, aliasName: String, oldIndex: String?, newIndex: String) {
        val call = prepareCall("switchAlias")
        val map = mapOf(
            "aliasName" to aliasName,
            "oldIndex" to oldIndex,
            "newIndex" to newIndex
        )
        call.parameter = map

        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    override fun checkAndCreateInformationIndex() {
        val call = prepareCall("checkAndCreateInformationIndex")

        sendCallToIBusses(call)
    }

    override fun getIndexTypeIdentifier(indexInfo: IndexInfo): String {
        return ("=>" + indexInfo.toIndex) + ":" + indexInfo.toType
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean) {
        val call = prepareCall("update")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo
        map["doc"] = doc
        map["updateOldIndex"] = updateOldIndex
        call.parameter = map

        sendCallToIBusses(call)
    }

    fun update(iBusIndex: Int, indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean) {
        val call = prepareCall("update")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo // jacksonObjectMapper().convertValue(indexinfo, Any::class.java)
        map["doc"] = doc
        map["updateOldIndex"] = updateOldIndex
        call.parameter = map

        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    @Throws(IOException::class)
    override fun updatePlugDescription(plugDescription: PlugDescription) {
        log.warn("Not implemented")
    }

    @Throws(InterruptedException::class, ExecutionException::class)
    override fun updateIPlugInformation(id: String, info: String) {
        val call = prepareCall("updateIPlugInformation")
        val map: MutableMap<String, Any> = HashMap()
        map["id"] = id
        map["info"] = info
        call.parameter = map

        sendCallToIBusses(call)
    }

    @Throws(InterruptedException::class, ExecutionException::class)
    fun updateIPlugInformation(iBusIndex: Int, id: String, info: String) {
        val call = prepareCall("updateIPlugInformation")
        val map: MutableMap<String, Any> = HashMap()
        map["id"] = id
        map["info"] = info
        call.parameter = map

        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    override fun flush() {
        val call = prepareCall("flush")

        sendCallToIBusses(call)
    }


    fun flush(iBusIndex: Int) {
        val call = prepareCall("flush")
        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    override fun deleteIndex(index: String) {
        val call = prepareCall("deleteIndex")
        call.parameter = index

        sendCallToIBusses(call)
    }

    fun deleteIndex(iBusIndex: Int, index: String?) {
        val call = prepareCall("deleteIndex")
        call.parameter = index

        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    override fun getIndices(filter: String): Array<String> {
        val call = prepareCall("getIndices")
        call.parameter = filter

        val response = sendCallToIBusses(call)
        return response!!["result"] as Array<String>
    }

    fun getIndices(iBusIndex: Int, filter: String?): Array<String>? {
        val call = prepareCall("getIndices")
        call.parameter = filter

        val response = sendCallToIBus(iBusses!![iBusIndex], call)
        return response?.get("result") as Array<String>?
    }

    override fun getMapping(indexInfo: IndexInfo): Map<String, Any> {
        val call = prepareCall("getMapping")
        call.parameter = indexInfo

        val response = sendCallToIBusses(call)
        return response!!["result"] as Map<String, Any>
    }

    fun getMapping(iBusIndex: Int, indexInfo: IndexInfo): Map<String, Any> {
        val call = prepareCall("getMapping")
        call.parameter = indexInfo

        val response = sendCallToIBus(iBusses!![iBusIndex], call)
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

    @Throws(InterruptedException::class, ExecutionException::class, IOException::class)
    override fun updateHearbeatInformation(iPlugIdInfos: Map<String, String>) {
        val call = prepareCall("updateHearbeatInformation")
        call.parameter = iPlugIdInfos

        sendCallToIBusses(call)
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        val call = prepareCall("deleteDocById")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo
        map["id"] = id
        map["updateOldIndex"] = updateOldIndex
        call.parameter = map

        sendCallToIBusses(call)
    }

    fun delete(iBusIndex: Int, indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        val call = prepareCall("deleteDocById")
        val map: MutableMap<String, Any> = HashMap()
        map["indexinfo"] = indexinfo
        map["id"] = id
        map["updateOldIndex"] = updateOldIndex
        call.parameter = map

        sendCallToIBus(iBusses!![iBusIndex], call)
    }

    override fun indexExists(indexName: String): Boolean {
        val call = prepareCall("indexExists")
        call.parameter = indexName

        val response = sendCallToIBusses(call)
        return response!!["result"] as Boolean
    }

    fun indexExists(iBusIndex: Int, indexName: String?): Boolean {
        val call = prepareCall("indexExists")
        call.parameter = indexName

        val response = sendCallToIBus(iBusses!![iBusIndex], call)
        return (if (response != null) response["result"] else false) as Boolean
    }

    fun search(query: IngridQuery, start: Int, length: Int): IngridHits? {
        val call = prepareCall("search")

        val map: MutableMap<String, Any> = HashMap()
        map["query"] = query
        map["start"] = start
        map["length"] = length
        call.parameter = map

        val response = sendCallToIBusses(call)
        return response!!["result"] as IngridHits?
    }

    fun getDetail(hit: IngridHit, query: IngridQuery, fields: Array<String?>): IngridHitDetail? {
        val call = prepareCall("getDetail")

        val map: MutableMap<String, Any> = HashMap()
        map["hit"] = hit
        map["query"] = query
        map["fields"] = fields
        call.parameter = map

        val response = sendCallToIBusses(call)
        return response!!["result"] as IngridHitDetail?
    }

    fun getDetails(hits: Array<IngridHit?>, query: IngridQuery, fields: Array<String?>): Array<IngridHitDetail>? {
        val call = prepareCall("getDetails")

        val map: MutableMap<String, Any> = HashMap()
        map["hits"] = hits
        map["query"] = query
        map["fields"] = fields
        call.parameter = map

        val response = sendCallToIBusses(call)
        return response!!["result"] as Array<IngridHitDetail>?
    }

    private fun sendCallToIBusses(call: IngridCall): IngridDocument? {
        var response: IngridDocument? = null
        for (ibus in getIBusses()!!) {
            try {
                val currentResponse = ibus.call(call)
                if (response == null) {
                    response = currentResponse
                }
            } catch (e: Exception) {
                log.error("Error relaying index message: " + call.method, e)
            }
        }
        return response
    }

    private fun sendCallToIBus(iBus: IBus, call: IngridCall): IngridDocument? {
        try {
            return iBus.call(call)
        } catch (e: Exception) {
            log.error("Error relaying index message: " + call.method, e)
            return null
        }
    }

    /**
     * Simplify creation of IngridCall object.
     * @param method
     * @return
     */
    private fun prepareCall(method: String): IngridCall {
        val call = IngridCall()
        call.target = "__centralIndex__"
        call.method = method
        return call
    }

    fun getDocById(documentId: String?): ElasticDocument? {
        val call = prepareCall("getDocById")
        call.parameter = documentId

        val response = sendCallToIBusses(call)
        return response!!["result"] as ElasticDocument?
    }

    companion object {
        private val log: Logger = LogManager.getLogger(
            IBusIndexManager::class.java
        )
    }
}