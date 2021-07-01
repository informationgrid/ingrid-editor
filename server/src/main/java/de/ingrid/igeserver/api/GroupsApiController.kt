package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class GroupsApiController @Autowired constructor(
    private val catalogService: CatalogService,
    private val groupService: GroupService,
    private val authUtils: AuthUtils
) : GroupsApi {

    override fun createGroup(principal: Principal, group: Group): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        return ResponseEntity.ok(groupService.create(catalogId, group))
    }

    override fun deleteGroup(principal: Principal, id: Int): ResponseEntity<Void> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)


        groupService.remove(catalogId, id)
        return ResponseEntity(HttpStatus.OK)
    }

    override fun getGroup(principal: Principal, id: Int): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        return when (val group = groupService.get(catalogId, id)) {
            null -> ResponseEntity.notFound().build()
            else -> ResponseEntity.ok(group)
        }
    }

    override fun listGroups(principal: Principal): ResponseEntity<List<Group>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val groups = groupService.getAll(catalogId)
        return ResponseEntity.ok(groups)
    }

    override fun updateGroup(principal: Principal, id: Int, group: Group): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val updatedGroup = groupService.update(catalogId, id, group)
        return ResponseEntity.ok(updatedGroup)
    }

    override fun getUsersOfGroup(principal: Principal, id: Int): ResponseEntity<List<User>> {

        val users = groupService.getUsersOfGroup(id)
            .map { User(it.userId) }
        return ResponseEntity.ok(users)

    }
}
