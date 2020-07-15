package de.ingrid.igeserver.db

class FindOptions(
        val queryType: QueryType?,
        val queryOperator: String = "OR",
        val size: Int? = null,
        val sortField: String? = null,
        val sortOrder: String? = null,
        val resolveReferences: Boolean = false)