package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.*
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

data class PermissionInfo(
    val canRead: Boolean = false,
    val canWrite: Boolean = false
)

@Service
class IgeAclService {

    @Autowired
    lateinit var aclService: AclService

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

    private fun isAllowed(acl: Acl, permission: Permission, sids: List<Sid>): Boolean {
        return try {
            acl.isGranted(listOf(permission), sids, false)
        } catch (nfe: NotFoundException) {
            false
        }
    }

}