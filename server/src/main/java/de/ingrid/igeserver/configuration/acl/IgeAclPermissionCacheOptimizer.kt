package de.ingrid.igeserver.configuration.acl

import org.apache.logging.log4j.LogManager
import org.hibernate.Hibernate
import org.hibernate.proxy.HibernateProxy
import org.springframework.core.log.LogMessage
import org.springframework.security.acls.AclPermissionCacheOptimizer
import org.springframework.security.acls.domain.ObjectIdentityRetrievalStrategyImpl
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.ObjectIdentity
import org.springframework.security.acls.model.ObjectIdentityRetrievalStrategy
import org.springframework.security.acls.model.SidRetrievalStrategy
import org.springframework.security.core.Authentication

class IgeAclPermissionCacheOptimizer(private val aclService: AclService): AclPermissionCacheOptimizer(aclService) {

    companion object {
        private val logger = LogManager.getLogger()
    }

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    private val oidRetrievalStrategy: ObjectIdentityRetrievalStrategy = ObjectIdentityRetrievalStrategyImpl()


    override fun cachePermissionsFor(authentication: Authentication?, objects: Collection<*>) {
        if (objects.isEmpty()) {
            return
        }
        val oidsToCache: MutableList<ObjectIdentity> = ArrayList(objects.size)
        for (domainObject in objects) {
            if (domainObject != null) {
                // handle proxies
                val finalDomainObject = if (domainObject is HibernateProxy) {
                    Hibernate.unproxy(domainObject)
                } else domainObject
                
                val oid = oidRetrievalStrategy.getObjectIdentity(finalDomainObject)
                oidsToCache.add(oid)
            }
        }
        val sids = sidRetrievalStrategy.getSids(authentication)
        logger.debug(LogMessage.of { "Eagerly loading Acls for " + oidsToCache.size + " objects" })
        aclService.readAclsById(oidsToCache, sids)
    }
    
}