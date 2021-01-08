package de.ingrid.igeserver.services

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.treeToValue
import de.ingrid.igeserver.model.Group
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryOperator
import de.ingrid.igeserver.persistence.model.meta.GroupType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

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

}
