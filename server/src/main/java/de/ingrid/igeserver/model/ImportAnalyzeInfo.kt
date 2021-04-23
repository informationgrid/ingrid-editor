package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode

class ImportAnalyzeInfo {
    var importType: String? = null
    var numDocuments = 0
    var result: JsonNode? = null
}
