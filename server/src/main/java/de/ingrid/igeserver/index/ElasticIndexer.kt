package de.ingrid.igeserver.index
import com.jillesvangurp.ktsearch.*
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.PlugDescription
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import java.text.SimpleDateFormat
import java.util.*

data class ElasticClient(
    val client: SearchClient,
    val bulkProcessor: BulkSession
)

/**
 * Utility class to manage elasticsearch indices and documents.
 * @author Andre
 */
class ElasticIndexer(val clientId: Int): IIndexManager {
    private val log = logger()

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String? {
        TODO("Not yet implemented")
    }

    override fun createIndex(name: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        TODO("Not yet implemented")
    }

    override fun checkAndCreateInformationIndex() {
        TODO("Not yet implemented")
    }

    override fun getIndexTypeIdentifier(indexInfo: IndexInfo): String {
        TODO("Not yet implemented")
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean) {
        TODO("Not yet implemented")
    }

    override fun updatePlugDescription(plugDescription: PlugDescription) {
        TODO("Not yet implemented")
    }

    override fun updateIPlugInformation(id: String, info: String) {
        TODO("Not yet implemented")
    }

    override fun flush() {
        TODO("Not yet implemented")
    }

    override fun deleteIndex(index: String) {
        TODO("Not yet implemented")
    }

    override fun getIndices(filter: String): Array<String> {
        TODO("Not yet implemented")
    }

    override fun getMapping(indexInfo: IndexInfo): Map<String, Any?> {
        TODO("Not yet implemented")
    }

    override val defaultMapping: String?
        get() = TODO("Not yet implemented")
    override val defaultSettings: String?
        get() = TODO("Not yet implemented")

    override fun updateHearbeatInformation(iPlugIdInfos: Map<String, String>) {
        TODO("Not yet implemented")
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        TODO("Not yet implemented")
    }

    override fun indexExists(indexName: String): Boolean {
        TODO("Not yet implemented")
    }

} 

/*{
    private var clients: List<ElasticClient> = emptyList()

    init {
        updateConfig(listOf(ElasticConfig(1, "my elastic", "localhost", 9300)))
    }
    
    private fun createElasticClient(config: ElasticConfig): SearchClient {
            return SearchClient(KtorRestClient(config.ip, config.port))
    }

    final fun updateConfig(configs: List<ElasticConfig>) {
        clients = configs.map {
            val client = createElasticClient(it)
            ElasticClient(
                client,
                client.bulkSession(timeout = Duration.parse("5"), callBack = bulkProcessorListener)
            )
        }
    }

    *//**
     * Insert or update a document to the lucene index. For updating the documents must be indexed by its ID and the global configuration
     * "indexWithAutoId" (index.autoGenerateId) has to be disabled.
     *
     * @param indexinfo
     * contains information about the index to be used besided other information
     * @param doc
     * is the document to be indexed
     * @param updateOldIndex
     * if true, it'll be checked if the current index differs from the real index, which is used during reindexing
     *//*
    override fun update(indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean) {
//        val indexRequest: IndexRequest = IndexRequest()
//        indexRequest.index(indexinfo.getRealIndexName())
//
//        indexRequest.id(doc["uuid"] as String?)
//
//        _bulkProcessor!!.add(indexRequest.source(doc))
        
        runBlocking { 
            clients[0].bulkProcessor.index(doc, indexinfo.getRealIndexName(), doc["uuid"].toString())
        }

        if (updateOldIndex) {
            val oldIndex: String? = getIndexNameFromAliasName(indexinfo.getToAlias(), null)
            // if the current index differs from the real index, then it means there's an indexing going on
            // and if the real index name is the same as the index alias, it means that no complete indexing happened yet
            if ((oldIndex != null) && !(oldIndex == indexinfo.getRealIndexName()) && (!indexinfo.getToIndex()
                    .equals(indexinfo.getRealIndexName()))
            ) {
                val otherIndexInfo: IndexInfo = indexinfo.clone()
                otherIndexInfo.setRealIndexName(oldIndex)
                update(otherIndexInfo, doc, false)
            }
        }
    }

    *//**
     * Delete a document with a given ID from an index/type. The ID must not be autogenerated but a unique ID from the source document.
     *
     * @param indexinfo describes the index to be used
     * @param id is the ID of the document to be deleted
     * @param updateOldIndex if true then also remove document from previous index in case we're indexing right now
     *//*
    override fun delete(indexinfo: IndexInfo, id: String?, updateOldIndex: Boolean) {
        val deleteRequest: DeleteRequest = DeleteRequest()
        deleteRequest.index(indexinfo.getRealIndexName()).id(id)

        _bulkProcessor!!.add(deleteRequest)

        if (updateOldIndex) {
            val oldIndex: String? = getIndexNameFromAliasName(indexinfo.getToAlias(), null)
            if (oldIndex != null && !(oldIndex == indexinfo.getRealIndexName())) {
                val otherIndexInfo: IndexInfo = indexinfo.clone()
                otherIndexInfo.setRealIndexName(oldIndex)
                delete(otherIndexInfo, id, false)
            }
        }
    }

    private val bulkProcessorListener: BulkProcessor.Listener
        get() = object : BulkProcessor.Listener {
            override fun beforeBulk(executionId: Long, request: BulkRequest) {}
            override fun afterBulk(executionId: Long, request: BulkRequest, response: BulkResponse) {
                if (response.hasFailures()) {
                    log.error("Bulk to Elasticsearch had failures: " + response.buildFailureMessage())
                }
            }

            override fun afterBulk(executionId: Long, request: BulkRequest, t: Throwable) {
                log.error("An error occured during bulk indexing", t)
            }
        }

    override fun flush() {
        _bulkProcessor!!.flush()
    }

    *//**
     * This function does not seem to be used anywhere
     *//*
    @Deprecated("")
    fun flushAndClose() {
        _bulkProcessor!!.flush()
        _bulkProcessor!!.close()
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        // check if alias actually exists
        // boolean aliasExists = _client.admin().indices().aliasesExist( new GetAliasesRequest( aliasName ) ).actionGet().exists();
        if (oldIndex != null) removeFromAlias(aliasName, oldIndex)
        val prepareAliases: IndicesAliasesRequestBuilder = client.admin().indices().prepareAliases()
        prepareAliases.addAlias(newIndex, aliasName).execute().actionGet()
    }

    fun addToAlias(aliasName: String?, newIndex: String?) {
        val prepareAliases: IndicesAliasesRequestBuilder = client.admin().indices().prepareAliases()
        prepareAliases.addAlias(newIndex, aliasName).execute().actionGet()
    }

    fun removeFromAlias(aliasName: String, index: String?) {
        var indexNameFromAliasName: String? = getIndexNameFromAliasName(aliasName, (index)!!)
        while (indexNameFromAliasName != null) {
            val prepareAliases: IndicesAliasesRequestBuilder = client.admin().indices().prepareAliases()
            prepareAliases.removeAlias(indexNameFromAliasName, aliasName).execute().actionGet()
            indexNameFromAliasName = getIndexNameFromAliasName(aliasName, (index))
        }
    }

    fun removeAlias(aliasName: String) {
        removeFromAlias(aliasName, null)
    }

    *//**
     * Function does not seem to be used!?
     *//*
    @Deprecated("")
    fun typeExists(indexName: String, type: String?): Boolean {
        val typeRequest: TypesExistsRequest = TypesExistsRequest(arrayOf(indexName), type)
        try {
            return client.admin().indices().typesExists(typeRequest).actionGet().isExists
        } catch (e: IndexNotFoundException) {
            return false
        }
    }

    override fun deleteIndex(index: String) {
        client.admin().indices().prepareDelete(index).execute().actionGet()
    }

    override fun getIndices(filter: String): Array<String> {
        return Arrays.stream<String>(client.admin().indices().prepareGetIndex().get().indices)
            .filter({ index: String -> index.contains(filter) })
            .toArray<String>({ _Dummy_.__Array__() })
    }

    // type will not be used soon anymore
    // use createIndex(String name, String esMapping) instead?
    // @Deprecated
    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        val indexExists: Boolean = indexExists(name)
        if (!indexExists) {
            if (esMapping != null) {
                val createIndexRequestBuilder: CreateIndexRequestBuilder = client.admin().indices().prepareCreate(name)
                    .addMapping(type, esMapping, XContentType.JSON)

                if (esSettings != null) {
                    createIndexRequestBuilder.setSettings(esSettings, XContentType.JSON)
                }
                createIndexRequestBuilder.execute().actionGet()
            } else {
                client.admin().indices().prepareCreate(name)
                    .execute().actionGet()
            }
            return true
        }
        return false
    }

    fun createIndex(name: String, source: String?): Boolean {
        val indexExists: Boolean = indexExists(name)
        if (!indexExists) {
            if (source != null) {
                client.admin().indices().prepareCreate(name)
                    .addMapping("_default_", source, XContentType.JSON)
                    .execute().actionGet()
            } else {
                client.admin().indices().prepareCreate(name)
                    .execute().actionGet()
            }
            return true
        }
        return false
    }

    override fun createIndex(name: String): Boolean {
        val defaultMappingStream: InputStream? = javaClass.classLoader.getResourceAsStream("default-mapping.json")
        if (defaultMappingStream == null) {
            log.warn("Could not find mapping file 'default-mapping.json' for creating index: $name")
            return createIndex(name, null)
        } else {
            try {
                val source: String = XMLSerializer.getContents(defaultMappingStream)
                return createIndex(name, source)
            } catch (e: IOException) {
                log.error("Error getting default mapping for index creation", e)
            }
        }

        return false
    }

    override fun getDefaultMapping(): String {
        val defaultMappingStream: InputStream? = javaClass.classLoader.getResourceAsStream("default-mapping.json")
        if (defaultMappingStream != null) {
            try {
                return XMLSerializer.getContents(defaultMappingStream)
            } catch (e: IOException) {
                log.error("Error deserializing default mapping file", e)
            }
        }
        return null
    }

    override fun getDefaultSettings(): String {
        val defaultSettingsStream: InputStream? = javaClass.classLoader.getResourceAsStream("default-settings.json")
        if (defaultSettingsStream != null) {
            try {
                return XMLSerializer.getContents(defaultSettingsStream)
            } catch (e: IOException) {
                log.error("Error deserializing default settings file", e)
            }
        }
        return null
    }

    override fun indexExists(name: String): Boolean {
        return client.admin().indices().prepareExists(name).execute().actionGet().isExists
    }

    *//**
     * Get the index matching the partial name from an alias.
     *
     * @param indexAlias
     * is the alias name to check for connected indices
     * @param partialName
     * is the first part of the index to be matched, if there are several
     * @return the found index name
     *//*
    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String? {
        val indexName = runBlocking { 
            val aliases = clients[0].client.getAliases(indexAlias)
            (aliases[indexAlias])?.aliases?.keys?.filter { it.contains(partialName) }?.first()
        }
        
        return indexName
        *//*val indexToAliasesMap: ImmutableMap<String, List<AliasMetadata>>? =
            client.admin().indices().getAliases(GetAliasesRequest(indexAlias)).actionGet().aliases

        if (indexToAliasesMap != null && !indexToAliasesMap.isEmpty) {
            val iterator: Iterator<ObjectCursor<String>> = indexToAliasesMap.keys().iterator()
            var result: String? = null
            while (iterator.hasNext()) {
                val next: String = iterator.next().value
                if (partialName == null || next.contains(partialName)) {
                    result = next
                }
            }

            return (result)!!
        } else if (client.admin().indices().prepareExists(indexAlias).execute().actionGet().isExists) {
            // alias seems to be the index itself
            return indexAlias
        }
        return null*//*
    }

    override fun getMapping(indexInfo: IndexInfo): Map<String, Any>? {
        val indexName: String = getIndexNameFromAliasName(indexInfo.getRealIndexName(), null)
        val cs: ClusterState = client.admin().cluster().prepareState().setIndices(indexName).execute().actionGet().state
        val mappingMetaData: MappingMetadata? = cs.metadata().index(indexName).mapping()
        if (mappingMetaData == null) {
            return null
        } else {
            return mappingMetaData.sourceAsMap
        }
    }

    fun refreshIndex(indexName: String?) {
        client.admin().indices().refresh(RefreshRequest(indexName)).actionGet()
    }

    fun printSettings(): String {
        return client.settings().toDelimitedString(',')
    }

    fun shutdown() {
        client.close()
    }

    *//**
     *
     * Check if index ingrid_meta exists. If not create it.
     *
     *
     * Applies mappings from **required** ingrid-meta-mapping.json found in classpath.
     *
     *
     * Applies settings from optional ingrid-meta-settings.json found in classpath.
     *//*
    override fun checkAndCreateInformationIndex() {
        if (!indexExists("ingrid_meta")) {
            try {
                javaClass.classLoader.getResourceAsStream("ingrid-meta-mapping.json").use { ingridMetaMappingStream ->
                    if (ingridMetaMappingStream == null) {
                        log.error("Could not find mapping file 'ingrid-meta-mapping.json' for creating index 'ingrid_meta'")
                    } else {
                        // settings are optional
                        var settings: String? = null
                        try {
                            javaClass.getClassLoader().getResourceAsStream("ingrid-meta-settings.json")
                                .use { ingridMetaSettingsStream ->
                                    if (ingridMetaSettingsStream != null) {
                                        settings =
                                            XMLSerializer.getContents(ingridMetaSettingsStream)
                                    }
                                }
                        } catch (e: IOException) {
                            log.warn(
                                "Could not deserialize: ingrid-meta-settings.json, continue without settings.",
                                e
                            )
                        }

                        val mapping: String =
                            XMLSerializer.getContents(ingridMetaMappingStream)
                        createIndex("ingrid_meta", "info", mapping, (settings)!!)
                    }
                }
            } catch (e: IOException) {
                log.error("Could not deserialize: ingrid-meta-mapping.json", e)
            }
        }
    }

    override fun getIndexTypeIdentifier(indexInfo: IndexInfo): String {
        return (_config.uuid + "=>" + indexInfo.getToIndex()).toString() + ":" + indexInfo.getToType()
    }


    val allIPlugInformation: IngridDocument
        get() {
            val response: SearchResponse = client.prepareSearch("ingrid_meta")
                .setSize(1000)
                .setFetchSource(true)
                .get()

            val hits: SearchHits = response.hits
            val iPlugInfos: MutableList<IngridDocument> = ArrayList()

            for (i in 0 until hits.totalHits.value) {
                val doc: IngridDocument = mapIPlugInformatioToIngridDocument(hits.getAt(i.toInt()))
                iPlugInfos.add(doc)
            }

            val result: IngridDocument = IngridDocument()
            result["iPlugInfos"] = iPlugInfos
            return result
        }

    fun getIPlugInformation(plugId: String?): IngridDocument? {
        val response: SearchResponse = client.prepareSearch("ingrid_meta")
            .setQuery(QueryBuilders.termQuery("plugId", plugId)) // .setFetchSource( new String[] { "*" }, null )
            .setSize(1)
            .setFetchSource(true) //.storedFields("iPlugName", "datatype", "fields")
            .get()

        val hits: SearchHits = response.hits

        if (hits.totalHits.value > 0) {
            return mapIPlugInformatioToIngridDocument(hits.getAt(0))
        }

        return null
    }

    private fun mapIPlugInformatioToIngridDocument(hit: SearchHit): IngridDocument {
        val doc: IngridDocument = IngridDocument()

        val sourceAsMap: Map<String, Any> = hit.sourceAsMap
        doc["plugId"] = sourceAsMap.get("plugId")
        doc["name"] = sourceAsMap.get("iPlugName")
        doc["plugdescription"] = sourceAsMap.get("plugdescription")
        return doc
    }

    @Throws(IOException::class)
    override fun updatePlugDescription(plugDescription: PlugDescription) {
        val uuid: String? = plugDescription.get("uuid") as String?

        val response: SearchResponse = client.prepareSearch("ingrid_meta")
            .setQuery(QueryBuilders.wildcardQuery("indexId", uuid))
            .get()

        plugDescription.remove("METADATAS")
        // @formatter:off
        val updateData: XContentBuilder = XContentFactory.jsonBuilder().startObject()
            .field("plugdescription", plugDescription)
            .endObject()

        val hits: SearchHits = response.hits
        if (hits.totalHits.value > 2) {
            log.warn("There are more than 2 documents found for indexId starting with $uuid")
        }
        hits.forEach(Consumer {
                hit:SearchHit -> val updateRequest: UpdateRequest = UpdateRequest("ingrid_meta", hit.getId())
            _bulkProcessor!!.add(updateRequest.doc(updateData, XContentType.JSON))
        })
    }

    @Throws(InterruptedException::class, ExecutionException::class)  override fun updateIPlugInformation(id:String, info:String) {
        synchronized(this ){
            val docId: String
            val indexRequest: IndexRequest = IndexRequest()
            indexRequest.index("ingrid_meta")

            // the iPlugDocIdMap can lead to problems if a wrong ID was stored once, then the iBus has to be restarted
            val response: SearchResponse = client.prepareSearch("ingrid_meta")
                .setQuery(QueryBuilders.termQuery("indexId", id))
                .addSort("lastIndexed", SortOrder.DESC) // sort to get most current on top
                // .setFetchSource( new String[] { "*" }, null )
                // .setSize(1)
                .get()

            val hits: SearchHits = response.getHits()
            val totalHits: Long = hits.getTotalHits().value

            // do update document
            if (totalHits == 1L) {
                docId = hits.getAt(0).getId()
                val updateRequest: UpdateRequest = UpdateRequest("ingrid_meta", docId)
                // add index request to queue to avoid sending of too many requests
                _bulkProcessor!!.add(updateRequest.doc(info, XContentType.JSON))
            } else if (totalHits == 0L) {
                // create document immediately so that it's available for further requests
                client.index(indexRequest.source(info, XContentType.JSON)).get().getId()
            } else {
                log.warn("There is more than one iPlug information document in the index of: " + id)
                log.warn("Removing items and adding new one")
                val searchHits: Array<SearchHit> = hits.getHits()
                // delete all hits except the first one
                for (i in 1 until searchHits.size)  {
                    val hit: SearchHit = searchHits.get(i)
                    val deleteRequest: DeleteRequest = DeleteRequest()
                    deleteRequest.index("ingrid_meta").id(hit.getId())
                    _bulkProcessor!!.add(deleteRequest)
                }
                flush()


                // add first hit, which we did not delete
                val updateRequest: UpdateRequest = UpdateRequest("ingrid_meta", searchHits.get(0).getId())
                _bulkProcessor!!.add(updateRequest.doc(info, XContentType.JSON))
            }
        }
    }

    @Throws(ExecutionException::class)  override fun updateHearbeatInformation(iPlugIdInfos:Map<String, String>) {
        checkAndCreateInformationIndex()
        for (id:String in iPlugIdInfos.keys)  {
            try  {
                updateIPlugInformation(id, (iPlugIdInfos.get(id))!!)
            }catch (ex:IndexNotFoundException) {
                log.warn("Index for iPlug information not found ... creating: $id")
            }catch (ex:InterruptedException) {
                log.warn("updateHearbeatInformation was interrupted for ID: $id")
            }
        }
    }

    fun getDocById(id:Any): ElasticDocument? {
        val idAsString: String = id.toString()
        val indexNames: Array<IndexInfo> = _config.activeIndices
        // iterate over all indices until document was found
        for (indexName:IndexInfo in indexNames)  {
            try  {
                val source: Map<String, Any>? = client.prepareGet(indexName.getRealIndexName(), null, idAsString)
                    .setFetchSource(_config.indexFieldsIncluded, _config.indexFieldsExcluded)
                    .execute().actionGet().getSource()

                if (source != null) {
                    return ElasticDocument(source)
                }
            }catch (ex:IndexNotFoundException) {
                log.warn("Index was not found. We probably have to clean up or refresh the active indices here. Missing index is: " + indexName.getToAlias())
            }
        }

        return null
    }

    companion object {
        private val log:Logger = LogManager.getLogger(IndexManager::class.java)

        *//**
         * Generate a new ID for a new index of the format <index-name>_<id>, where <id> is number counting up.
         *
         * @param name is the name of the index without the timestamp
         * @param uuid is a uuid to make this index unique (uuid or name from iPlug)
         * @return a new index name including the current timestamp
        </id></id></index-name> *//*
        fun getNextIndexName(name:String?, uuid:String, uuidName:String): String {
            var uuidName: String = uuidName
            if (name == null) {
                throw RuntimeException("Old index name must not be null!")
            }
            uuidName = uuidName.lowercase(Locale.getDefault())
            var isNew: Boolean = false

            val dateFormat: SimpleDateFormat = SimpleDateFormat("yyyyMMddHHmmssS")

            val delimiterPos: Int = name.lastIndexOf("_")
            if (delimiterPos == -1) {
                isNew = true
            } else {
                try  {
                    dateFormat.parse(name.substring(delimiterPos + 1))
                }catch (ex:Exception) {
                    isNew = true
                }
            }

            val date: String = dateFormat.format(Date())

            if (isNew) {
                if (!name.contains(uuid)) {
                    return name + "@" + uuidName + "-" + uuid + "_" + date
                }
                return name + "_" + date
            } else {
                if (!name.contains(uuid)) {
                    return name.substring(0, delimiterPos) + "@" + uuidName + "-" + uuid + "_" + date
                }
                return name.substring(0, delimiterPos + 1) + date
            }
        }
    }}*/