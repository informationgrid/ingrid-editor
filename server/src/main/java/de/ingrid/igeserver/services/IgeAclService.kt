/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.configuration.acl.CustomPermission
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.model.meta.RootPermissionType
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.GrantedAuthoritySid
import org.springframework.security.acls.domain.ObjectIdentityImpl
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.model.Acl
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.MutableAcl
import org.springframework.security.acls.model.NotFoundException
import org.springframework.security.acls.model.Permission
import org.springframework.security.acls.model.Sid
import org.springframework.security.acls.model.SidRetrievalStrategy
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

data class PermissionInfo(
    val canRead: Boolean = false,
    val canWrite: Boolean = false,
    val canOnlyWriteSubtree: Boolean = false,
)

@Service
class IgeAclService(
    val aclService: AclService,
    val docWrapperRepo: DocumentWrapperRepository,
    val authUtils: AuthUtils,
) {

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    fun hasRightsForGroup(authentication: Authentication, group: Group): Boolean {
        if (authUtils.isAdmin(authentication)) {
            return true
        }
        val permissionLevels = listOf("writeTree", "readTree", "writeTreeExceptParent")
        val sids = sidRetrievalStrategy.getSids(authentication)
        val hasRootWrite = checkForRootPermissions(sids, listOf(BasePermission.WRITE))
        val hasRootRead = checkForRootPermissions(sids, listOf(BasePermission.READ))

        var isAllowed: Boolean
        permissionLevels.forEach { permissionLevel ->
            val permissionLevelIds = getDatasetIdsSetInGroups(listOf(group), permissionLevel)
            permissionLevelIds.forEach { id ->
                val acl = this.aclService.readAclById(
                    ObjectIdentityImpl(DocumentWrapper::class.java, id),
                )
                @Suppress("UNREACHABLE_CODE")
                isAllowed = when (permissionLevel) {
                    "writeTree" -> isAllowed(acl, BasePermission.WRITE, sids) || hasRootWrite
                    "readTree" -> isAllowed(acl, BasePermission.READ, sids) || hasRootRead || hasRootWrite
                    "writeTreeExceptParent" ->
                        isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids) ||
                            isAllowed(acl, BasePermission.WRITE, sids) ||
                            hasRootWrite

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
                ObjectIdentityImpl(DocumentWrapper::class.java, id),
            )

            PermissionInfo(
                isAllowed(acl, BasePermission.READ, sids) || hasRootRead || hasRootWrite,
                isAllowed(acl, BasePermission.WRITE, sids) || hasRootWrite,
                isAllowed(acl, CustomPermission.WRITE_ONLY_SUBTREE, sids),
            )
        } catch (nfe: NotFoundException) {
            PermissionInfo()
        }
    }

    /**
     *  Get all dataset ids which are explicitly set in the groups which match the permission level
     *  @param groups list of groups
     *  @param permissionLevel permission level to filter for. If empty, all permissions are considered
     *  @param isAddress if true, only addresses are considered and if false, only documents are considered (if null, both are considered)
     */
    fun getDatasetIdsSetInGroups(
        groups: Collection<Group>,
        permissionLevel: String = "",
        isAddress: Boolean? = null,
    ): List<Int> = groups
        .asSequence()
        // get all dataset permissions for each group
        .map { group ->
            mutableListOf<JsonNode>().apply {
                if (isAddress != false) addAll(group.permissions?.addresses ?: emptyList())
                if (isAddress != true) addAll(group.permissions?.documents ?: emptyList())
            }
        }
        // filter for permission level
        .map { permissions ->
            permissions.filter { permission ->
                permissionLevel.isEmpty() || permission.get("permission").asText() == permissionLevel
            }
        }
        // get the dataset ids and flatten the list
        .map { permissions -> permissions.map { permission -> permission.get("id").asInt() } }
        .flatten().toSet().toList()

    private fun isAllowed(acl: Acl, permission: Permission, sids: List<Sid>): Boolean {
        return try {
            acl.isGranted(listOf(permission), sids, false)
        } catch (nfe: NotFoundException) {
            try {
                if (permission == BasePermission.WRITE &&
                    acl.parentAcl != null &&
                    acl.parentAcl.isGranted(listOf(CustomPermission.WRITE_ONLY_SUBTREE), sids, false)
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

    /**
     * Check if any group has root read access
     * @param groups list of groups
     */
    fun hasRootReadAccess(groups: Set<Group>) =
        groups.any {
            listOf(
                RootPermissionType.READ,
                RootPermissionType.WRITE,
            ).contains(it.permissions?.rootPermission)
        }
}

fun checkForRootPermissions(
    sids: List<Sid>,
    requiredPermissions: List<Permission?>,
): Boolean {
    if (requiredPermissions.any { it == BasePermission.WRITE }) return sids.any { (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_write_root" }
    if (requiredPermissions.any { it == BasePermission.READ }) {
        return sids.any {
            (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_write_root" || (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_read_root"
        }
    }
    return false
}
