package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.repository.GroupRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.*
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

data class PermissionInfo(
    val canRead: Boolean = false,
    val canWrite: Boolean = false,
    val canOnlyWriteSubtree: Boolean = false
)

@Service
class IgeAclService @Autowired constructor(
    val aclService: AclService,
    val groupRepo: GroupRepository,
    val docWrapperRepo: DocumentWrapperRepository
) {

    fun hasRightsForGroup(authentication: Authentication, group: Group): Boolean {
        if (hasAdminRole(authentication)) {
            return true
        }
        val permissionLevels = listOf("writeTree", "readTree", "writeTreeExceptParent")
        val sids = SidRetrievalStrategyImpl().getSids(authentication)

        var isAllowed = false
        permissionLevels.forEach { permissionLevel ->
            val permissionLevelUuids = getAllDatasetUuidsFromGroups(listOf(group), permissionLevel)
            permissionLevelUuids.forEach { uuid ->
                val acl = this.aclService.readAclById(
                    ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
                )
                isAllowed = when (permissionLevel) {
                    "writeTree" -> isAllowed(acl, BasePermission.WRITE, sids)
                    "readTree" -> isAllowed(acl, BasePermission.READ, sids)
                    "writeTreeExceptParent" -> isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids)
                    else -> {
                        throw error("this is impossible and must not happen.")
                    }
                }
                // if one permission is not allowed, we can stop here
                if (!isAllowed) return false
            }
        }
        // if we are here, all permissions are allowed
        return true
    }

    fun getPermissionInfo(authentication: Authentication, id: Int?): PermissionInfo {
        if (hasAdminRole(authentication)) {
            return PermissionInfo(true, true, false)
        } else if (id == null) {
            return PermissionInfo()
        }

        return try {

            val acl = this.aclService.readAclById(
                ObjectIdentityImpl(DocumentWrapper::class.java, id)
            )
            val sids = SidRetrievalStrategyImpl().getSids(authentication)

            PermissionInfo(
                isAllowed(acl, BasePermission.READ, sids),
                isAllowed(acl, BasePermission.WRITE, sids),
                isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids)
            )
        } catch (nfe: NotFoundException) {
            PermissionInfo()
        }
    }

    fun getDatasetUuidsFromGroups(groups: Collection<Group>, isAddress: Boolean): List<Int> {
        return groups
            .map { group -> if (isAddress) group.permissions?.addresses else group.permissions?.documents }
            .map { permissions -> permissions?.map { permission -> permission.get("id").asInt() }.orEmpty() }
            .flatten().toSet().toList()
    }

    fun getAllDatasetUuidsFromGroups(groups: Collection<Group>, permissionLevel: String = ""): List<Int> {
        return groups
            .map { group ->
                mutableListOf<JsonNode>().apply {
                    addAll(group.permissions?.addresses ?: emptyList())
                    addAll(group.permissions?.documents ?: emptyList())
                }
            }
            .map { permissions ->
                permissions.filter { permission ->
                    permissionLevel.isEmpty() || permission.get("permission").asText() == permissionLevel
                }
            }
            .map { permissions -> permissions.map { permission -> permission.get("id").asInt() } }
            .flatten().toSet().toList()
    }

    private fun isAllowed(acl: Acl, permission: Permission, sids: List<Sid>): Boolean {
        return try {
            acl.isGranted(listOf(permission), sids, false)
        } catch (nfe: NotFoundException) {
            try {
                if (permission == BasePermission.WRITE
                    && acl.parentAcl != null
                    && acl.parentAcl.isGranted(listOf(CustomPermission.WRITE_ONLY_SUBTREE), sids, false)
                ) {
                    return true
                }
            } catch (_: NotFoundException) {
                return false
            }
            false
        }
    }

    fun createAclForDocument(id: Int, parentId: Int?) {
        // first create permission ACL
        val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, id)
        val acl = (aclService as JdbcMutableAclService).createAcl(objIdentity)

        if (parentId != null) {
            val parentObjIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, parentId)
            val parentAcl = aclService.readAclById(parentObjIdentity)
            acl.setParent(parentAcl)
            (aclService as JdbcMutableAclService).updateAcl(acl)
        }
    }

    fun updateParent(id: Int, parentId: Int?) {
        val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, id)
        val acl = aclService.readAclById(objIdentity) as MutableAcl

        if (parentId == null) {
            acl.setParent(null)
        } else {
            val parentObjIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, parentId)
            val parentAcl = aclService.readAclById(parentObjIdentity)
            acl.setParent(parentAcl)
        }
        (aclService as JdbcMutableAclService).updateAcl(acl)
    }

    fun removeAclForDocument(uuid: String) {
        val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
        (aclService as JdbcMutableAclService).deleteAcl(objIdentity, true)
    }

    private fun hasAdminRole(authentication: Authentication): Boolean {
        val roles = authentication.authorities.map { it.authority }
        return roles.contains("ige-super-admin") || roles.contains("cat-admin")
    }

}
