package de.ingrid.igeserver.model

data class QueryField(val field: String, val operator: String?, val value: String?, val invert: Boolean = false) {
    constructor(field: String, value: String?, invert: Boolean = false) : this(field, null, value, invert)
}