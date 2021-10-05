package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.apache.logging.log4j.kotlin.logger
import org.hibernate.proxy.HibernateProxy
import org.springframework.core.log.LogMessage
import org.springframework.security.acls.AclPermissionEvaluator
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.ObjectIdentityRetrievalStrategyImpl
import org.springframework.security.acls.domain.PermissionFactory
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.*
import org.springframework.security.core.Authentication
import java.io.Serializable
import java.util.*

class IgeAclPermissionEvaluator(val aclService: AclService) : AclPermissionEvaluator(aclService) {

    val logger = logger()

    private val objectIdentityRetrievalStrategy: ObjectIdentityRetrievalStrategy = ObjectIdentityRetrievalStrategyImpl()

    private val objectIdentityGenerator: ObjectIdentityGenerator = ObjectIdentityRetrievalStrategyImpl()

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    private val permissionFactory: PermissionFactory = CustomPermissionFactory()

    override fun hasPermission(
        authentication: Authentication,
        targetId: Serializable?,
        targetType: String?,
        permission: Any
    ): Boolean {
        if (hasAdminRole(authentication)) {
            return true
        }

        // root elements can only be created by admins
        if (targetId == null) {
            return false
        }

        val objectIdentity = this.objectIdentityGenerator.createObjectIdentity(targetId, targetType)
        return checkPermission(authentication, objectIdentity, permission, null)
    }

    override fun hasPermission(authentication: Authentication, domainObject: Any?, permission: Any): Boolean {
        if (domainObject == null) {
            return false
        }

        if (hasAdminRole(authentication)) {
            return true
        }

        // convert HibernateProxy to real document class if necessary
        val finalDomainObject = if (domainObject is HibernateProxy) {
            domainObject.writeReplace()
        } else domainObject

        val objectIdentity = objectIdentityRetrievalStrategy.getObjectIdentity(finalDomainObject)
        return checkPermission(authentication, objectIdentity, permission, finalDomainObject)
    }

    private fun hasAdminRole(authentication: Authentication): Boolean {
        val roles = authentication.authorities.map { it.authority }
        return roles.contains("ige-super-admin") || roles.contains("cat-admin")
    }

    private fun checkPermission(
        authentication: Authentication,
        oid: ObjectIdentity,
        permission: Any,
        domainObject: Any?
    ): Boolean {
        // Obtain the SIDs applicable to the principal
        val sids = sidRetrievalStrategy.getSids(authentication)
        val requiredPermission = resolvePermission(permission)
        logger.debug(LogMessage.of { "Checking permission '$permission' for object '$oid'" })
        var acl: Acl? = null
        try {
            // TODO ADAPT FOR SUBTREE RIGHTS
            // Lookup only ACLs for SIDs we're interested in
            acl = this.aclService.readAclById(oid, sids)
            if (acl.isGranted(requiredPermission, sids, false)) {
                logger.debug("Access is granted")
                if (domainObject is DocumentWrapper) {
                    // TODO: set true, if already checked permission is WRITE

                    if (acl.parentAcl != null) {
                        // parent: implicit permission. special case: parent has onlySubTree -> then child has write
                        domainObject.hasWritePermission = try {
                            acl.parentAcl.isGranted(
                                listOf(BasePermission.WRITE, CustomPermission.WRITE_ONLY_SUBTREE),
                                sids,
                                false
                            )
                        } catch (nfe: NotFoundException) {
                            false
                        }
                    } else {
                        // no parent: needs explicit permissions
                        domainObject.hasWritePermission = try {
                            acl.isGranted(listOf(BasePermission.WRITE), sids, false)
                        } catch (nfe: NotFoundException) {
                            false
                        }
                        domainObject.hasOnlySubtreeWritePermission = try {
                            acl.isGranted(listOf(CustomPermission.WRITE_ONLY_SUBTREE), sids, false)
                        } catch (nfe: NotFoundException) {
                            false
                        }
                    }

                    // set hasOnlySubtreeWritePermission
                    domainObject.hasOnlySubtreeWritePermission = try {
                        acl.isGranted(
                            listOf(CustomPermission.WRITE_ONLY_SUBTREE),
                            sids,
                            false
                        )
                    } catch (nfe: NotFoundException) {
                        false
                    }
                    // make sure state is valid (hasOnlySubtreeWritePermission and hasWritePermission cannot both be true)
                    domainObject.hasOnlySubtreeWritePermission =
                        domainObject.hasOnlySubtreeWritePermission && !domainObject.hasWritePermission
                }
                return true
            }

            logger.debug("Returning false - ACLs returned, but insufficient permissions for this principal")
        } catch (nfe: NotFoundException) {
            try {
                // check if WRITE_ONLY_SUBTREE Permission was used
                if (acl != null && permission == "WRITE"
                    && acl.isGranted(listOf(CustomPermission.WRITE_ONLY_SUBTREE), sids, false)
                ) {
                    // check that it's not the root node, where we only have read access
                    if (acl.parentAcl != null) {
                        logger.debug("Access is granted for WRITE_ONLY_SUBTREE permission and not being root")
                        return true
                    }
                }
            } catch (nfe: NotFoundException) {
                logger.debug("WRITE_ONLY_SUBTREE permission also not found")
            }

            logger.debug("Returning false - no ACLs apply for this principal")
        }
        return false
    }

    fun resolvePermission(permission: Any): List<Permission?> {
        if (permission is Int) {
            return listOf(permissionFactory.buildFromMask(permission))
        }
        if (permission is Permission) {
            return listOf(permission)
        }
        if (permission is Array<*> && permission.isArrayOf<Permission>()) {
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

    private fun buildPermission(permString: String): Permission? {
        return try {
            this.permissionFactory.buildFromName(permString)
        } catch (notfound: IllegalArgumentException) {
            this.permissionFactory.buildFromName(permString.toUpperCase(Locale.ENGLISH))
        }
    }
}