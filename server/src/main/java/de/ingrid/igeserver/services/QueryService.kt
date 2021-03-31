package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.QueryType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class QueryService @Autowired constructor(private val dbApi: DBApi) {

    fun getQueriesForUser(userId: String, catalogId: String): List<JsonNode> {

        return dbApi.findAll(QueryType::class)
        
    }

    fun saveQueryForUser(userId: String, data: JsonNode): JsonNode {
        return dbApi.save(QueryType::class, null, data.toString())
    }

}