package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
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
import java.util.*


@Service
class GroupService @Autowired constructor(
    private val groupRepo: GroupRepository,
    private val userRepo: UserRepository,
    private val catalogRepo: CatalogRepository,
    private val aclService: AclService
) {

    private val log = logger()

    @Transactional
    fun create(catalogId: String, group: Group, manager: UserInfo?): Group {
        group.catalog = catalogRepo.findByIdentifier(catalogId)
        group.data = group.data ?: GroupData()
        group.data?.creationDate = Date()
        group.data?.modificationDate = Date()
        group.manager = manager

        updateAcl(group, true)

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
    fun update(catalogId: String, id: Int, group: Group): Group {

        val oldGroup = get(catalogId, id)!!
        group.apply {
            this.id = oldGroup.id
            catalog = oldGroup.catalog
            manager = group.manager ?: oldGroup.manager
        }
        group.data = oldGroup.data ?: GroupData()
        group.data?.modificationDate = Date()

        removeAllPermissionsFromGroup(oldGroup)
        updateAcl(group)

        return groupRepo.save(group)

    }

    private fun removeAllPermissionsFromGroup(group: Group) {
        aclService as JdbcMutableAclService

        getAllDocPermissions(group).forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
            val acl = aclService.readAclById(objIdentity) as MutableAcl

            // remove all permission entries except Administration (otherwise entry cannot be modified by a user who did not create it)
            // new permissions will be added later
            for (index in acl.entries.size - 1 downTo 0) {
                if (acl.entries[index].permission != BasePermission.ADMINISTRATION) {
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

    private fun updateAcl(group: Group, withAdministerPermission: Boolean = false) {
        aclService as JdbcMutableAclService

        getAllDocPermissions(group).forEach {
            val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, it.get("uuid").asText())
            val acl: MutableAcl = try {
                aclService.readAclById(objIdentity) as MutableAcl
            } catch (ex: org.springframework.security.acls.model.NotFoundException) {
                log.warn("Created new ACL for already existing group: ${group.id}")
                aclService.createAcl(objIdentity)
            }

            val sid = GrantedAuthoritySid("GROUP_${group.name}")

            addACEs(acl, it, sid, withAdministerPermission)
            aclService.updateAcl(acl)
        }
    }

    private fun addACEs(
        acl: MutableAcl,
        docPermission: JsonNode,
        sid: GrantedAuthoritySid,
        withAdministerPermission: Boolean
    ) {
        determinePermission(docPermission, withAdministerPermission)
            .forEach {
                acl.insertAce(acl.entries.size, it, sid, true)
            }
    }

    private fun determinePermission(docPermission: JsonNode, includeAdministration: Boolean): List<Permission> {
        val permission = when (docPermission.get("permission").asText()) {
            "writeTree" -> listOf(BasePermission.READ, BasePermission.WRITE)
            "writeTreeExceptParent" -> listOf(BasePermission.READ, CustomPermission.WRITE_ONLY_SUBTREE)
            "readTree" -> listOf(BasePermission.READ)
            else -> listOf(BasePermission.READ)
        }
        return if (includeAdministration) listOf(BasePermission.ADMINISTRATION) + permission else permission
    }

    fun remove(catalogId: String, id: Int) {

        groupRepo.deleteById(id)

    }

    fun getUsersOfGroup(id: Int): List<UserInfo> {
        return userRepo.findByGroups_Id(id)
    }

    fun removeDocFromGroups(catalogId: String, docId: String) {
        var wasUpdated = false
        
        this.getAll(catalogId).forEach { group ->
            val countDocsBefore = (group.permissions?.documents?.size ?: 0) + (group.permissions?.addresses?.size ?: 0)

            group.permissions?.apply {
                documents = group.permissions?.documents?.filter { it.get("uuid").asText() != docId } ?: emptyList()
                addresses = group.permissions?.addresses?.filter { it.get("uuid").asText() != docId } ?: emptyList()
            }
            val countDocsAfter = (group.permissions?.documents?.size ?: 0) + (group.permissions?.addresses?.size ?: 0)

            if (countDocsBefore > countDocsAfter) {
                update(catalogId, group.id!!, group)
                log.debug("Group ${group.id} must be updated after document '${docId}' was deleted")
                wasUpdated = true
            }
        }
        
        if (!wasUpdated) {
            log.debug("No group had to be updated after deleting document '${docId}'")
        }
    }

}
