package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.DocumentWrapperRepository
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
    val docWrapperRepo: DocumentWrapperRepository
) {

    fun getPermissionInfo(authentication: Authentication, uuid: String): PermissionInfo {
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
            .map {group -> if (isAddress) group.permissions?.addresses else group.permissions?.documents }
            .map { permissions -> permissions?.mapNotNull { permission -> permission.get("uuid").asText() }.orEmpty() }
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

}
