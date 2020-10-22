package de.ingrid.igeserver.persistence

class FindOptions(
    override val queryType: QueryType = QueryType.EXACT,
    override val queryOperator: QueryOperator = QueryOperator.OR,
    val size: Int? = null,
    val sortField: String? = null,
    val sortOrder: String? = null,
    val resolveReferences: Boolean = false
) : QueryOptions(queryType)