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

import org.apache.logging.log4j.kotlin.logger
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

    val logger = logger()

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