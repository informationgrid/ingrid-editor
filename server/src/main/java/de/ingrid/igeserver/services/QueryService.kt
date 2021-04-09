package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLAccess
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class QueryService @Autowired constructor(private val dbApi: PostgreSQLAccess, private val dateService: DateService) {

    fun getQueriesForUser(userId: String, catalogId: String): List<Query> {

        val userQueriesHql = """
            SELECT e FROM Query e 
            WHERE e.catalog.identifier='$catalogId' AND e.user.userId='$userId'            
            """
        val userQueries = dbApi.findAll(
            Query::class,
            userQueriesHql
        ).hits
        
        val systemQueriesHql = """
            SELECT e FROM Query e 
            WHERE e.catalog.identifier='$catalogId' AND e.user IS NULL            
            """
        val systemQueries = dbApi.findAll(
            Query::class,
            systemQueriesHql
        ).hits

        return userQueries + systemQueries
    }

    fun saveQueryForUser(userId: String, data: Query): Query {

        val user = dbApi.findAll(
            UserInfo::class,
            listOf(QueryField("userId", userId)),
            FindOptions()
        ).hits[0]

        data.user = user
        data.modified = dateService.now()

        return dbApi.save(data)
    }

    fun removeQueryForUser(userId: String, id: Int) {

        val entity = dbApi.find(Query::class, id)
        dbApi.remove(entity)

    }

}