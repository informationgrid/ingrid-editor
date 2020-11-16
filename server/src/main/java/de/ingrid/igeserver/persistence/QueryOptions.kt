package de.ingrid.igeserver.persistence

open class QueryOptions(
    open val queryType: QueryType = QueryType.EXACT,
    open val queryOperator: QueryOperator = QueryOperator.OR
)