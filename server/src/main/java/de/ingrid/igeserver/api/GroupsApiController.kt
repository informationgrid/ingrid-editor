package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class GroupsApiController @Autowired constructor(
    private val catalogService: CatalogService,
    private val groupService: GroupService,
    private val igeAclService: IgeAclService,
    private val authUtils: AuthUtils
) : GroupsApi {

    override fun createGroup(principal: Principal, group: Group): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        // check if user has permission to create group
        if (!igeAclService.hasRightsForGroup(
                principal as Authentication,
                group
            )
        ) {
            return ResponseEntity(HttpStatus.FORBIDDEN)
        }
        val manager = catalogService.getUser(authUtils.getUsernameFromPrincipal(principal))
        return ResponseEntity.ok(groupService.create(catalogId, group, manager))
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
        val userId = authUtils.getUsernameFromPrincipal(principal)
        var groups = groupService.getAll(catalogId)

        val isCatAdmin = authUtils.isAdmin(principal)
        if (isCatAdmin) {
            return ResponseEntity.ok(groups)
        }

        val userGroupIds = catalogService.getUser(userId)?.groups?.map { it.id!! } ?: emptyList()

        // user is not allowed to edit groups he is a member of
        // user is only allowed to edit groups he has rights for
        groups = groups
            .filter { userDoesNotBelongToGroup(userGroupIds, it) }
            .filter { userHasRightsForGroupsPermissions(userId, principal, it) }

        return ResponseEntity.ok(groups)
    }

    private fun userHasRightsForGroupsPermissions(
        userId: String,
        principal: Principal,
        group: Group
    ) = group.manager?.userId == userId || igeAclService.hasRightsForGroup(
        principal as Authentication,
        group
    )

    private fun userDoesNotBelongToGroup(
        userGroupIds: List<Int>,
        group: Group
    ) = !userGroupIds.contains(group.id!!)


    override fun updateGroup(principal: Principal, id: Int, group: Group): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val updatedGroup = groupService.update(catalogId, id, group, true)
        return ResponseEntity.ok(updatedGroup)
    }

    override fun getUsersOfGroup(principal: Principal, id: Int): ResponseEntity<List<User>> {
        val users = groupService.getUsersOfGroup(id, principal)
        return ResponseEntity.ok(users)
    }

    override fun getManagerOfGroup(principal: Principal, id: Int): ResponseEntity<User> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        return when (val manager = groupService.get(catalogId, id)?.manager) {
            null -> ResponseEntity.notFound().build()
            else -> ResponseEntity.ok(User(manager.userId))
        }

    }

    override fun updateManager(principal: Principal, id: Int, userId: String): ResponseEntity<Group> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        var group = groupService.get(catalogId, id)
        var newManager = catalogService.getUser(userId)
        if (group != null && newManager != null) {
            group.manager = newManager
            return ResponseEntity.ok(groupService.update(catalogId, id, group, false))
        } else {
            return ResponseEntity.notFound().build()
        }
    }
}
