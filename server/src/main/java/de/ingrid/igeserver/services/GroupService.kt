package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.GroupData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.UserRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Sort
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.GrantedAuthoritySid
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.MutableAcl
import org.springframework.security.acls.model.Permission
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.util.*


@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val userRepo: UserRepository,
    private val catalogRepo: CatalogRepository,
    private val aclService: AclService,
    private var keycloakService: UserManagementService
) {

    private val log = logger()

    @Transactional
    fun create(catalogId: String, group: Group, manager: UserInfo?): Group {
        group.catalog = catalogRepo.findByIdentifier(catalogId)
        group.data = group.data ?: GroupData()
        group.data?.creationDate = Date()
        group.data?.modificationDate = Date()
        group.manager = manager

        updateAcl(group)

        return groupRepo.save(group)

        /*group.permissions?.documents?.forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
            val acl = aclService.createAcl(objIdentity)
            aclService.updateAcl(acl)
        }*/
    }

    fun getAll(catalogId: String): List<Group> {

        return groupRepo.findAllByCatalog_Identifier(catalogId, Sort.by(Sort.Direction.ASC, "name"))

    }

    fun exists(catalogId: String, id: Int): Boolean {
        return get(catalogId, id) != null
    }

    fun get(catalogId: String, id: Int): Group? {

        return groupRepo.findAllByCatalog_IdentifierAndId(catalogId, id)

    }

    @Transactional
    fun update(catalogId: String, id: Int, group: Group, updateAcls: Boolean): Group {

        val oldGroup = get(catalogId, id)!!
        group.apply {
            this.id = oldGroup.id
            catalog = oldGroup.catalog
            manager = group.manager ?: oldGroup.manager
        }
        group.data = oldGroup.data ?: GroupData()
        group.data?.modificationDate = Date()

        if (updateAcls) {
            removeAllPermissionsFromGroup(oldGroup)
            updateAcl(group)
        }

        return groupRepo.save(group)

    }

    private fun removeAllPermissionsFromGroup(group: Group) {
        aclService as JdbcMutableAclService

        val sid = GrantedAuthoritySid("GROUP_${group.name}")

        getAllDocPermissions(group).forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("id").asInt())
            val acl = aclService.readAclById(objIdentity) as MutableAcl

            // new permissions will be added later
            for (index in acl.entries.size - 1 downTo 0) {
                // only remove ACE from current SID (the readAclById-function can be called with SIDs,
                // however it is not reliable and returns often ACEs from all SIDs!)
                if (acl.entries[index].sid == sid) {
                    acl.deleteAce(index)
                }
            }
            aclService.updateAcl(acl)
        }
    }

    private fun getAllDocPermissions(group: Group): List<JsonNode> {
        val docs = group.permissions?.documents ?: emptyList()
        val addresses = group.permissions?.addresses ?: emptyList()

        return docs + addresses
    }

    private fun updateAcl(group: Group) {
        aclService as JdbcMutableAclService

        getAllDocPermissions(group).forEach {
            val objIdentity =
                ObjectIdentityImpl(DocumentWrapper::class.java, if (it.get("id").isNull) null else it.get("id").asInt())
            val acl: MutableAcl = try {
                aclService.readAclById(objIdentity) as MutableAcl
            } catch (ex: org.springframework.security.acls.model.NotFoundException) {
                log.warn("Created new ACL for already existing group: ${group.id}")
                aclService.createAcl(objIdentity)
            }

            val sid = GrantedAuthoritySid("GROUP_${group.name}")

            addACEs(acl, it, sid)
            aclService.updateAcl(acl)
        }
    }

    private fun addACEs(
        acl: MutableAcl,
        docPermission: JsonNode,
        sid: GrantedAuthoritySid
    ) {
        determinePermission(docPermission)
            .forEach {
                acl.insertAce(acl.entries.size, it, sid, true)
            }
    }

    private fun determinePermission(docPermission: JsonNode): List<Permission> {
        return when (docPermission.get("permission").asText()) {
            "writeTree" -> listOf(BasePermission.READ, BasePermission.ADMINISTRATION, BasePermission.WRITE)
            "writeTreeExceptParent" -> listOf(
                BasePermission.READ,
                BasePermission.ADMINISTRATION,
                CustomPermission.WRITE_ONLY_SUBTREE
            )
            "readTree" -> listOf(BasePermission.READ)
            else -> listOf(BasePermission.READ)
        }
    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }

    fun getUsersOfGroup(id: Int, principal: Principal): List<User> {
        keycloakService.getClient(principal).use { client ->
            val users = userRepo.findByGroups_Id(id)
                .map {
                    keycloakService.getUser(client, it.userId).apply { role = it.role?.name ?: "" }
                }
            return users
        }
    }

    fun getUserIdsOfGroup(id: Int, principal: Principal): List<String> = getUserIdsOfGroup(id, principal, emptyList())
    fun getUserIdsOfGroup(id: Int, principal: Principal, ignoredRoles: List<String>): List<String> =
        userRepo.findByGroups_Id(id).filterNot { ignoredRoles.contains(it.role?.name) }.map { it.userId }


    fun removeDocFromGroups(catalogId: String, docId: Int) {
        var wasUpdated = false

        this.getAll(catalogId).forEach { group ->
            val countDocsBefore = (group.permissions?.documents?.size ?: 0) + (group.permissions?.addresses?.size ?: 0)

            group.permissions?.apply {
                documents =
                    group.permissions?.documents?.filter { it.get("id").asInt() != docId } ?: emptyList()
                addresses =
                    group.permissions?.addresses?.filter { it.get("id").asInt() != docId } ?: emptyList()
            }
            val countDocsAfter = (group.permissions?.documents?.size ?: 0) + (group.permissions?.addresses?.size ?: 0)

            if (countDocsBefore > countDocsAfter) {
                update(catalogId, group.id!!, group, false)
                log.debug("Group ${group.id} must be updated after document '${docId}' was deleted")
                wasUpdated = true
            }
        }

        if (!wasUpdated) {
            log.debug("No group had to be updated after deleting document '${docId}'")
        }
    }

}
