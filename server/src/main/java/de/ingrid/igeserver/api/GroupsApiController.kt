package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Group
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class GroupsApiController @Autowired constructor(
    private val dbService: DBApi,
    private val catalogService: CatalogService,
    private val groupService: GroupService
) : GroupsApi {

    override fun createGroup(principal: Principal?, group: Group): ResponseEntity<Void> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(dbId).use {
            groupService.create(group)
            return ResponseEntity(HttpStatus.OK)
        }
    }

    override fun deleteGroup(principal: Principal?, id: String): ResponseEntity<Void> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(dbId).use {
            groupService.remove(id)
            return ResponseEntity(HttpStatus.OK)
        }
    }

    override fun getGroup(principal: Principal?, id: String): ResponseEntity<Group> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(dbId).use {
            return when (val group = groupService.get(id)) {
                null -> ResponseEntity.notFound().build()
                else -> ResponseEntity.ok(group)
            }
        }
    }

    override fun listGroups(principal: Principal?): ResponseEntity<List<Group>> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(dbId).use {
            val groups = groupService.getAll()
            return ResponseEntity.ok(groups)
        }
    }

    override fun updateGroup(principal: Principal?, id: String, group: Group): ResponseEntity<Group> {
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquireCatalog(dbId).use {
            return when (val updatedGroup = groupService.update(id, group)) {
                null -> ResponseEntity.status(500).build()
                else -> ResponseEntity.ok(updatedGroup)
            }
        }
    }
}
