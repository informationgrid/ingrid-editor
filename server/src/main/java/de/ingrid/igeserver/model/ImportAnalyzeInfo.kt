package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document

class ImportAnalyzeInfo {
    var importType: String? = null
    var numDocuments = 0
    var result: Document? = null
}
