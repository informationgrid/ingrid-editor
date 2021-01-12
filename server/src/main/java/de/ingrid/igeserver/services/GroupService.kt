package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.treeToValue
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.Group
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryOperator
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.meta.GroupType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import io.swagger.v3.core.util.Json
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.util.*

@Service
class GroupService @Autowired constructor(private val dbService: DBApi) {

    private val log = logger()

    private val mapperService = MapperService()
    
    fun create(group: Group) {
        
         dbService.save(GroupType::class, null, jacksonObjectMapper().writeValueAsString(group))
        
    }

    fun getAll(): List<Group> {
        
        val query = listOf(QueryField("catalog.identifier", dbService.currentCatalog))
        val entries = dbService.findAll(GroupType::class, query, FindOptions(sortField = "name", sortOrder = "ASC"))
        return entries.hits
            .mapNotNull { jacksonObjectMapper().treeToValue<Group>(it) }

    }

    fun get(id: String): Group? {

        val query = listOf(
            QueryField("catalog.identifier", dbService.currentCatalog),
            QueryField("identifier", id)
        )
        val result = dbService.findAll(GroupType::class, query, FindOptions(queryOperator = QueryOperator.AND))
        return when (result.totalHits) {
            0L -> null
            else -> jacksonObjectMapper().treeToValue<Group>(result.hits[0])
        }
        
    }

    fun update(id: String, group: Group): Group? {

        val recordId = dbService.getRecordId(GroupType::class, id)
        val savedGroup = dbService.save(GroupType::class, recordId, jacksonObjectMapper().writeValueAsString(group))
        return jacksonObjectMapper().treeToValue<Group>(savedGroup)
        
    }

    fun remove(id: String) {
        
        this.dbService.remove(GroupType::class, id)
        
    }
    
    fun getGroupsFromUser(userId: String): List<String> {
        dbService.acquireDatabase().use {
            val user = getUser(userId) ?: throw NotFoundException.withMissingUserCatalog(userId)
            
            val groupsByCatalog = user["groups"]
            val groups = groupsByCatalog?.get(dbService.currentCatalog) as ArrayNode?
            return groups?.mapNotNull { it.asText() } ?: emptyList()
        }
    }
    
    /*fun setGroupsForUser(userId: String, groups: List<String>) {
        val user = getUser(userId) as ObjectNode
        user.put("groups", groups)
    }*/
    
    fun getUser(userId: String): JsonNode? {
        val query = listOf(QueryField("userId", userId))
        val findOptions = FindOptions(
            queryType = QueryType.EXACT,
            resolveReferences = false)
        val list = dbService.findAll(UserInfoType::class, query, findOptions)
        return if (list.totalHits == 0L) {
            log.error("The user '$userId' does not seem to be assigned to any database.")
            null
        } else {
            list.hits[0]
        }
    }

}
