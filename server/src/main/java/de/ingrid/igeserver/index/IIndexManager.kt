package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.PlugDescription
import java.io.IOException
import java.util.concurrent.ExecutionException


interface IIndexManager {
    fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String?

    fun createIndex(name: String): Boolean

    fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean

    fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String)

    fun checkAndCreateInformationIndex()

    fun getIndexTypeIdentifier(indexInfo: IndexInfo): String

    fun update(indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean)

    @Throws(IOException::class)
    fun updatePlugDescription(plugDescription: PlugDescription)

    @Throws(InterruptedException::class, ExecutionException::class)
    fun updateIPlugInformation(id: String, info: String)

    fun flush()

    fun deleteIndex(index: String)

    fun getIndices(filter: String): Array<String>

    fun getMapping(indexInfo: IndexInfo): Map<String, Any?>

    val defaultMapping: String?

    val defaultSettings: String?

    @Throws(InterruptedException::class, ExecutionException::class, IOException::class)
    fun updateHearbeatInformation(iPlugIdInfos: Map<String, String>)

    fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean)

    fun indexExists(indexName: String): Boolean
}