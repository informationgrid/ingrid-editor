package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler

class GeodatasetMapper(metadata: Metadata, codeListService: CodelistHandler) : GeneralMapper(metadata, codeListService) {

    fun getTopicCategories(): List<KeyValue> {
        return emptyList()
    }
    
    fun getCharacterSet(): KeyValue? {
        return null
    }
    
    fun getLanguages(): List<KeyValue>? {
        return emptyList()
    }
}