package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class QueryService @Autowired constructor(private val dbApi: PostgreSQLAccess, private val dateService: DateService) {

    fun getQueriesForUser(userId: String, catalogId: String): List<Query> {

        return dbApi.findAll(Query::class)
        
    }

    fun saveQueryForUser(userId: String, data: Query): Query {
        data.modified = dateService.now()
        return dbApi.save(data)
    }

}