package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.GrantedAuthoritySid
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.*
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.security.Principal

data class PermissionInfo(
    val canRead: Boolean = false,
    val canWrite: Boolean = false,
    val canOnlyWriteSubtree: Boolean = false
)

@Service
class IgeAclService(
    val aclService: AclService,
    val docWrapperRepo: DocumentWrapperRepository,
    val authUtils: AuthUtils
) {

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()


    fun hasRightsForGroup(authentication: Authentication, group: Group): Boolean {
        if (authUtils.isAdmin(authentication)) {
            return true
        }
        val permissionLevels = listOf("writeTree", "readTree", "writeTreeExceptParent")
        val sids = sidRetrievalStrategy.getSids(authentication)

        var isAllowed: Boolean
        permissionLevels.forEach { permissionLevel ->
            val permissionLevelUuids = getAllDatasetIdsFromGroups(listOf(group), permissionLevel)
            permissionLevelUuids.forEach { uuid ->
                val acl = this.aclService.readAclById(
                    ObjectIdentityImpl(DocumentWrapper::class.java, uuid)
                )
                @Suppress("UNREACHABLE_CODE")
                isAllowed = when (permissionLevel) {
                    "writeTree" -> isAllowed(acl, BasePermission.WRITE, sids)
                    "readTree" -> isAllowed(acl, BasePermission.READ, sids)
                    "writeTreeExceptParent" -> isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids) || isAllowed(
                        acl,
                        BasePermission.WRITE,
                        sids
                    )

                    else -> throw error("this is impossible and must not happen.")
                }
                // if one permission is not allowed, we can stop here
                if (!isAllowed) return false
            }
        }
        // if we are here, all permissions are allowed
        return true
    }

    fun getPermissionInfo(authentication: Authentication, id: Int?): PermissionInfo {
        val sids = sidRetrievalStrategy.getSids(authentication)
        val hasRootWrite =
            checkForRootPermissions(sids, listOf(BasePermission.WRITE))
        val hasRootRead = checkForRootPermissions(sids, listOf(BasePermission.READ))

        if (authUtils.isAdmin(authentication)) {
            return PermissionInfo(true, true, false)
        } else if (id == null) {
            return PermissionInfo(hasRootRead || hasRootWrite, hasRootWrite, false)
        }

        return try {

            val acl = this.aclService.readAclById(
                ObjectIdentityImpl(DocumentWrapper::class.java, id)
            )

            PermissionInfo(
                isAllowed(acl, BasePermission.READ, sids) || hasRootRead || hasRootWrite,
                isAllowed(acl, BasePermission.WRITE, sids) || hasRootWrite,
                isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids)
            )
        } catch (nfe: NotFoundException) {
            PermissionInfo()
        }
    }

    fun getDatasetIdsFromGroups(groups: Collection<Group>, isAddress: Boolean): List<Int> {
        return groups
            .asSequence()
            .map { group -> if (isAddress) group.permissions?.addresses else group.permissions?.documents }
            .map { permissions -> permissions?.map { permission -> permission.get("id").asInt() }.orEmpty() }
            .flatten().toSet().toList()
    }

    fun getAllDatasetIdsFromGroups(groups: Collection<Group>, permissionLevel: String = ""): List<Int> {
        return groups
            .asSequence()
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

    fun removeAclForDocument(id: Int) {
        val objIdentity = ObjectIdentityImpl(DocumentWrapper::class.java, id)
        (aclService as JdbcMutableAclService).deleteAcl(objIdentity, true)
    }

    fun hasRootAccess(groups: Set<Group>) =
        groups.any {
            listOf(
                RootPermissionType.READ,
                RootPermissionType.WRITE
            ).contains(it.permissions?.rootPermission)
        }

    fun getDocumentIdsForGroups(principal: Principal, permissionLevel: String, catalogId: String): List<Int> {
        val groups = authUtils.getCurrentUserRoles(catalogId)
        val hasAccessToRootDocs = authUtils.isAdmin(principal) || hasRootAccess(groups)
        return if (hasAccessToRootDocs) emptyList() else getAllDatasetIdsFromGroups(groups)
    }

}

fun checkForRootPermissions(
    sids: List<Sid>,
    requiredPermissions: List<Permission?>
): Boolean {
    if (requiredPermissions.any { it == BasePermission.WRITE }) return sids.any { (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_write_root" }
    if (requiredPermissions.any { it == BasePermission.READ }) return sids.any {
        (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_write_root" || (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_read_root"
    }
    return false
}
