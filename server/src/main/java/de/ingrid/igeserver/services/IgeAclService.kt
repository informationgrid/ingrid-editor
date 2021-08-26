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
    val canWrite: Boolean = false
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
        val permissionLevels = listOf<String>("writeTree", "ReadTree", "writeTreeExceptParent")
        val sids = SidRetrievalStrategyImpl().getSids(authentication)

        var isAllowed  = false
        permissionLevels.forEach {
            val uuids = getAllDatasetUuidsFromGroups(listOf(group), it)
            uuids.map { uuid ->
                val acl = this.aclService.readAclById(
                    ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
                )
                when (it) {
                    "writeTree" -> isAllowed = isAllowed(acl, BasePermission.WRITE, sids)
                    "ReadTree" -> isAllowed = isAllowed(acl, BasePermission.READ, sids)
                    "writeTreeExceptParent" -> isAllowed = isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids)
                    else -> {
                        throw error("this is impossible and must not happen.")
                    }
                }
                if (!isAllowed) return false
            }
        }
        return isAllowed
    }

    fun getPermissionInfo(authentication: Authentication, uuid: String): PermissionInfo {
        if (hasAdminRole(authentication)) {
            return PermissionInfo(true, true)
        }

        return try {

            val acl = this.aclService.readAclById(
                ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
            )
            val sids = SidRetrievalStrategyImpl().getSids(authentication)

            PermissionInfo(
                isAllowed(acl, BasePermission.READ, sids),
                isAllowed(acl, BasePermission.WRITE, sids)
            )
        } catch (nfe: NotFoundException) {
            PermissionInfo()
        }
    }

    fun getDatasetUuidsFromGroups(groups: Collection<Group>, isAddress: Boolean): List<String> {
        return groups
            .map { group -> if (isAddress) group.permissions?.addresses else group.permissions?.documents }
            .map { permissions -> permissions?.mapNotNull { permission -> permission.get("uuid").asText() }.orEmpty() }
            .flatten().toSet().toList()
    }

    fun getAllDatasetUuidsFromGroups(groups: Collection<Group>, permissionLevel: String): List<String> {
        return groups
            .map { group ->
                mutableListOf<JsonNode>().apply {
                    addAll(group.permissions?.addresses ?: emptyList())
                    addAll(group.permissions?.documents ?: emptyList())
                }
            }
            .map { permissions ->
                permissions.filter { permission ->
                    permission.get("permission").asText() == permissionLevel
                }
            }
            .map { permissions -> permissions.mapNotNull { permission -> permission.get("uuid").asText() } }
            .flatten()
    }

    private fun isAllowed(acl: Acl, permission: Permission, sids: List<Sid>): Boolean {
        return try {
            acl.isGranted(listOf(permission), sids, false)
        } catch (nfe: NotFoundException) {
            false
        }
    }

    fun createAclForDocument(uuid: String, parentUuid: String?) {
        // first create permission ACL
        val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
        val acl = (aclService as JdbcMutableAclService).createAcl(objIdentity)

        if (parentUuid != null) {
            val parentObjIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, parentUuid)
            val parentAcl = aclService.readAclById(parentObjIdentity)
            acl.setParent(parentAcl)
            (aclService as JdbcMutableAclService).updateAcl(acl)
        }
    }

    private fun hasAdminRole(authentication: Authentication): Boolean {
        val roles = authentication.authorities.map { it.authority }
        return roles.contains("ige-super-admin") || roles.contains("cat-admin")
    }

}
