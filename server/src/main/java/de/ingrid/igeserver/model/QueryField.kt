package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.QueryType

data class QueryField(val field: String, val operator: String?, val queryType: QueryType = QueryType.EXACT, val value: String?, val invert: Boolean = false) {
    constructor(field: String, value: String?, invert: Boolean = false) : this(field, null, QueryType.EXACT, value, invert)
}