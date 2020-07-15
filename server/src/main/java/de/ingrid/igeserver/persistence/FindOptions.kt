package de.ingrid.igeserver.persistence

class FindOptions {
    var queryType: QueryType? = null
    var queryOperator = "OR"
    var size: Int? = null
    var sortField: String? = null
    var sortOrder: String? = null
    var resolveReferences = false
}