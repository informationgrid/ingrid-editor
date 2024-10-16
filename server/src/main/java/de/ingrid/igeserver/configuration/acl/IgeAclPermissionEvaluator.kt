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
package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.checkForRootPermissions
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.proxy.HibernateProxy
import org.springframework.core.log.LogMessage
import org.springframework.security.acls.AclPermissionEvaluator
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.GrantedAuthoritySid
import org.springframework.security.acls.domain.ObjectIdentityRetrievalStrategyImpl
import org.springframework.security.acls.domain.PermissionFactory
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.Acl
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.NotFoundException
import org.springframework.security.acls.model.ObjectIdentity
import org.springframework.security.acls.model.ObjectIdentityGenerator
import org.springframework.security.acls.model.ObjectIdentityRetrievalStrategy
import org.springframework.security.acls.model.Permission
import org.springframework.security.acls.model.Sid
import org.springframework.security.acls.model.SidRetrievalStrategy
import org.springframework.security.core.Authentication
import java.io.Serializable
import java.util.*

class IgeAclPermissionEvaluator(val aclService: AclService, val authUtils: AuthUtils) : AclPermissionEvaluator(aclService) {

    val logger = logger()

    private val objectIdentityRetrievalStrategy: ObjectIdentityRetrievalStrategy = ObjectIdentityRetrievalStrategyImpl()

    private val objectIdentityGenerator: ObjectIdentityGenerator = ObjectIdentityRetrievalStrategyImpl()

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    private val permissionFactory: PermissionFactory = CustomPermissionFactory()

    override fun hasPermission(
        authentication: Authentication,
        targetId: Serializable?,
        targetType: String?,
        permission: Any,
//        parentId: Serializable?
    ): Boolean {
        if (authUtils.isAdmin(authentication)) {
            return true
        }

        // root elements can only be created by admins
        if (targetId == null) {
            return false
        }

        val objectIdentity = objectIdentityGenerator.createObjectIdentity(targetId, targetType)
        return checkPermission(authentication, objectIdentity, permission, null)
    }

    override fun hasPermission(authentication: Authentication, domainObject: Any?, permission: Any): Boolean {
        if (domainObject == null) {
            return false
        }

        if (authUtils.isAdmin(authentication)) {
            return true
        }

        var finalDomainObject = if (domainObject is Optional<*>) {
            domainObject.get()
        } else {
            domainObject
        }

        // convert HibernateProxy to real document class if necessary
        if (finalDomainObject is HibernateProxy) {
            finalDomainObject = finalDomainObject.writeReplace()
        }

        if (finalDomainObject is Iterable<*>) {
            // check if all elements have permission
            return finalDomainObject.all { hasPermission(authentication, it, permission) }
        }

//        try {
        val objectIdentity = objectIdentityRetrievalStrategy.getObjectIdentity(finalDomainObject)
        return checkPermission(authentication, objectIdentity, permission, finalDomainObject)
        /*} catch (ex: IdentityUnavailableException) {
            // in this case we probably want to create document where the DB-ID is not known yet
            // check for permission for parent
            val objectIdentity = if (finalDomainObject is DocumentWrapper) {
                objectIdentityGenerator.createObjectIdentity(finalDomainObject.parent.id!!)
            } else if (finalDomainObject is Document) {
                objectIdentityGenerator.createObjectIdentity(finalDomainObject.parent.id)
            }
            return checkPermission(authentication, objectIdentity, permission, finalDomainObject)
        }*/
    }

    private fun checkPermission(
        authentication: Authentication,
        oid: ObjectIdentity,
        permission: Any,
        domainObject: Any?,
    ): Boolean {
        // Obtain the SIDs applicable to the principal
        val sids = sidRetrievalStrategy.getSids(authentication)
        return checkPermissionForSids(sids, oid, permission, domainObject)
    }

    fun checkPermissionForSids(
        sids: List<Sid>,
        oid: ObjectIdentity,
        permission: Any,
        domainObject: Any? = null,
    ): Boolean {
        val requiredPermission = resolvePermission(permission)
        logger.debug(LogMessage.of { "Checking permission '$permission' for object '$oid'" })

        // root permission handling
        if (checkForRootPermissions(sids, requiredPermission)) {
            if (domainObject is DocumentWrapper) {
                addWritePermissionInfo(domainObject, this.aclService.readAclById(oid, sids), sids)
                domainObject.hasWritePermission = domainObject.hasWritePermission || sids.any { (it as? GrantedAuthoritySid)?.grantedAuthority == "SPECIAL_write_root" }
            }
            return true
        }

        var acl: Acl? = null
        try {
            // Lookup only ACLs for SIDs we're interested in
            acl = this.aclService.readAclById(oid, sids)
            if (acl.isGranted(requiredPermission, sids, false)) {
                logger.debug("Access is granted")

                addWritePermissionInfo(domainObject, acl, sids)
                return true
            }

            logger.debug("Returning false - ACLs returned, but insufficient permissions for this principal")
        } catch (nfe: NotFoundException) {
            // no permission found for the node
            // try special permission WRITE_ONLY_SUBTREE if we want to write
            // but make sure we don't want to write on the top node where we only have read access
            // so we check for the permission on the parent node to make sure we definitely have write
            // permission being a child of a node with WRITE_ONLY_SUBTREE permission
            try {
                // check if WRITE_ONLY_SUBTREE Permission was used
                if (acl != null &&
                    requiredPermission.contains(BasePermission.WRITE) &&
                    acl.parentAcl != null &&
                    acl.parentAcl.isGranted(listOf(CustomPermission.WRITE_ONLY_SUBTREE), sids, false)
                ) {
                    logger.debug("Access is granted for WRITE_ONLY_SUBTREE permission and not being root")
                    return true
                } else if (acl == null && requiredPermission.contains(BasePermission.WRITE)) { // actually more "CREATE"
                }
            } catch (nfe: NotFoundException) {
                logger.debug("WRITE_ONLY_SUBTREE permission also not found")
            }

            logger.debug("Returning false - no ACLs apply for this principal")
        }
        return false
    }

    private fun addWritePermissionInfo(
        domainObject: Any?,
        acl: Acl,
        sids: List<Sid>?,
    ) {
        if (domainObject is DocumentWrapper) {
            // check for simple write permission
            domainObject.hasWritePermission = try {
                acl.isGranted(listOf(BasePermission.WRITE), sids, false)
            } catch (nfe: NotFoundException) {
                // in case parent has WRITE_ONLY_SUBTREE permission, children can still have write-permission
                // so check parent ACL if it has the permission
                try {
                    acl.parentAcl != null &&
                        acl.parentAcl.isGranted(
                            listOf(CustomPermission.WRITE_ONLY_SUBTREE),
                            sids,
                            false,
                        )
                } catch (nfe: NotFoundException) {
                    false
                }
            }

            // This permission can only occur if we don't have write permission.
            // Since isGranted also checks parents, the function returns true for child nodes
            // who actually have write permission.
            // So only when we don't have write permission and WRITE_ONLY_SUBTREE permission was found
            // then we can be sure to be on the top node with that permission.
            domainObject.hasOnlySubtreeWritePermission = try {
                !domainObject.hasWritePermission &&
                    acl.isGranted(
                        listOf(CustomPermission.WRITE_ONLY_SUBTREE),
                        sids,
                        false,
                    )
            } catch (nfe: NotFoundException) {
                false
            }
        }
    }

    fun resolvePermission(permission: Any): List<Permission?> {
        if (permission is Int) {
            return listOf(permissionFactory.buildFromMask(permission))
        }
        if (permission is Permission) {
            return listOf(permission)
        }
        if (permission is Array<*> && permission.isArrayOf<Permission>()) {
            @Suppress("UNCHECKED_CAST")
            return permission.asList() as List<Permission>
        }
        if (permission is String) {
            val p = buildPermission(permission)
            if (p != null) {
                return listOf(p)
            }
        }
        throw IllegalArgumentException("Unsupported permission: $permission")
    }

    private fun buildPermission(permString: String): Permission? = try {
        this.permissionFactory.buildFromName(permString)
    } catch (notfound: IllegalArgumentException) {
        this.permissionFactory.buildFromName(permString.uppercase(Locale.ENGLISH))
    }
}
