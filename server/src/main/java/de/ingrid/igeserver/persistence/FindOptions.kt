package de.ingrid.igeserver.persistence

class FindOptions(
        val queryType: QueryType = QueryType.EXACT,
        val queryOperator: String = "OR",
        val size: Int? = null,
        val sortField: String? = null,
        val sortOrder: String? = null,
        val resolveReferences: Boolean = false)