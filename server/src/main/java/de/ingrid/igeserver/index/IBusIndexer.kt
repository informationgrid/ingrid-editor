package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.PlugDescription

class IBusIndexer(private val iBusIndexManager: IBusIndexManager, private val clientIndex: Int): IIndexManager {
    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String): String? {
        return iBusIndexManager.getIndexNameFromAliasName(clientIndex, indexAlias, partialName)
    }

    override fun createIndex(name: String): Boolean {
        TODO("Not yet implemented")
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        return iBusIndexManager.createIndex(clientIndex, name, type, esMapping, esSettings)
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        return iBusIndexManager.switchAlias(clientIndex, aliasName, oldIndex, newIndex)
    }

    override fun checkAndCreateInformationIndex() {
        return iBusIndexManager.checkAndCreateInformationIndex()
    }

    override fun getIndexTypeIdentifier(indexInfo: IndexInfo): String {
        return iBusIndexManager.getIndexTypeIdentifier(indexInfo)
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument, updateOldIndex: Boolean) {
        return iBusIndexManager.update(clientIndex, indexinfo, doc, updateOldIndex)
    }

    override fun updatePlugDescription(plugDescription: PlugDescription) {
        TODO("Not yet implemented")
    }

    override fun updateIPlugInformation(id: String, info: String) {
        return iBusIndexManager.updateIPlugInformation(clientIndex, id, info)
    }

    override fun flush() {
        return iBusIndexManager.flush(clientIndex)
    }

    override fun deleteIndex(index: String) {
        return iBusIndexManager.deleteIndex(clientIndex, index)
    }

    override fun getIndices(filter: String): Array<String> {
        return iBusIndexManager.getIndices(clientIndex, filter) ?: emptyArray()
    }

    override fun getMapping(indexInfo: IndexInfo): Map<String, Any> {
        return iBusIndexManager.getMapping(clientIndex, indexInfo)
    }

    override val defaultMapping = iBusIndexManager.defaultMapping
    override val defaultSettings = iBusIndexManager.defaultSettings

    override fun updateHearbeatInformation(iPlugIdInfos: Map<String, String>) {
        TODO("Not yet implemented")
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        return iBusIndexManager.delete(clientIndex, indexinfo, id, updateOldIndex)
    }

    override fun indexExists(indexName: String): Boolean {
        return iBusIndexManager.indexExists(clientIndex, indexName)
    }
}