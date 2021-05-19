package de.ingrid.igeserver.configuration.acl

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.apache.logging.log4j.kotlin.logger
import org.keycloak.adapters.springsecurity.account.SimpleKeycloakAccount
import org.springframework.core.log.LogMessage
import org.springframework.security.acls.AclPermissionEvaluator
import org.springframework.security.acls.domain.*
import org.springframework.security.acls.model.*
import org.springframework.security.core.Authentication
import java.io.Serializable
import java.util.*

class IgeAclPermissionEvaluator(val aclService: AclService): AclPermissionEvaluator(aclService) {

    val logger = logger()

    private val objectIdentityRetrievalStrategy: ObjectIdentityRetrievalStrategy = ObjectIdentityRetrievalStrategyImpl()

    private val objectIdentityGenerator: ObjectIdentityGenerator = ObjectIdentityRetrievalStrategyImpl()

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    private val permissionFactory: PermissionFactory = DefaultPermissionFactory()

    override fun hasPermission(
        authentication: Authentication,
        targetId: Serializable?,
        targetType: String?,
        permission: Any?
    ): Boolean {
        if (hasAdminRole(authentication)) {
            return true
        }
        return super.hasPermission(authentication, targetId, targetType, permission)
    }

    override fun hasPermission(authentication: Authentication, domainObject: Any?, permission: Any): Boolean {
        if (domainObject == null) {
            return false
        }
        
        if (hasAdminRole(authentication)) {
            return true
        }

        val objectIdentity = objectIdentityRetrievalStrategy.getObjectIdentity(domainObject)
        return checkPermission(authentication, objectIdentity, permission, domainObject)
    }

    private fun hasAdminRole(authentication: Authentication): Boolean {
        val roles = (authentication.details as SimpleKeycloakAccount).roles
        return roles.contains("adminX") || roles.contains("cat-adminX")
    }

    private fun checkPermission(authentication: Authentication, oid: ObjectIdentity, permission: Any, domainObject: Any): Boolean {
        // Obtain the SIDs applicable to the principal
        val sids = sidRetrievalStrategy.getSids(authentication)
        val requiredPermission = resolvePermission(permission)
        logger.debug(LogMessage.of { "Checking permission '$permission' for object '$oid'" })
        try {
            // Lookup only ACLs for SIDs we're interested in
            val acl = this.aclService.readAclById(oid, sids)
            if (acl.isGranted(requiredPermission, sids, false)) {
                logger.debug("Access is granted")
                if (domainObject is DocumentWrapper) {
                    domainObject.hasWritePermission = try {
                        acl.isGranted(listOf(BasePermission.WRITE), sids, false)
                    } catch (nfe: NotFoundException) { false }
                }
                return true
            }
            logger.debug("Returning false - ACLs returned, but insufficient permissions for this principal")
        } catch (nfe: NotFoundException) {
            logger.debug("Returning false - no ACLs apply for this principal")
        }
        return false
    }

    fun resolvePermission(permission: Any): List<Permission?>? {
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