package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.CustomPermissionFactory
import de.ingrid.igeserver.configuration.acl.IgeAclPermissionCacheOptimizer
import de.ingrid.igeserver.configuration.acl.IgeAclPermissionEvaluator
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.cache.CacheManager
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.acls.domain.*
import org.springframework.security.acls.jdbc.BasicLookupStrategy
import org.springframework.security.acls.jdbc.JdbcMutableAclService
import org.springframework.security.acls.jdbc.LookupStrategy
import org.springframework.security.acls.model.AclService
import org.springframework.security.acls.model.PermissionGrantingStrategy
import org.springframework.security.core.authority.SimpleGrantedAuthority
import javax.sql.DataSource


@Configuration
@EnableAutoConfiguration
open class ACLContext {

    @Autowired
    var dataSource: DataSource? = null

    @Autowired lateinit var cacheManager: CacheManager

    @Bean
    open fun aclCache(): SpringCacheBasedAclCache {
        return SpringCacheBasedAclCache(
            cacheManager.getCache("aclCache"),
            permissionGrantingStrategy(),
            aclAuthorizationStrategy()
        )
    }

/*
    @Bean
    open fun aclEhCacheFactoryBean(): SpCacFac {
        val ehCacheFactoryBean = EhCacheFactoryBean()
        ehCacheFactoryBean.setCacheManager(aclCacheManager().getObject()!!)
        ehCacheFactoryBean.setCacheName("aclCache")
        return ehCacheFactoryBean
    }
*/

/*
    @Bean
    open fun aclCacheManager(): EhCacheManagerFactoryBean {
        return EhCacheManagerFactoryBean()
    }
*/

    @Bean
    open fun permissionGrantingStrategy(): PermissionGrantingStrategy {
        return DefaultPermissionGrantingStrategy(ConsoleAuditLogger())
    }

    @Bean
    open fun aclAuthorizationStrategy(): AclAuthorizationStrategy {
        return AclAuthorizationStrategyImpl(SimpleGrantedAuthority("ROLE_ACL_ACCESS"))
    }

    @Bean
    open fun defaultMethodSecurityExpressionHandler(): MethodSecurityExpressionHandler? {
        val expressionHandler = DefaultMethodSecurityExpressionHandler()
        val permissionEvaluator = IgeAclPermissionEvaluator(aclService())
        expressionHandler.setPermissionEvaluator(permissionEvaluator)
        expressionHandler.setPermissionCacheOptimizer(IgeAclPermissionCacheOptimizer(aclService()))
        return expressionHandler
    }


    @Bean
    open fun lookupStrategy(): LookupStrategy {
        val strategy = BasicLookupStrategy(dataSource, aclCache(), aclAuthorizationStrategy(), ConsoleAuditLogger())
        strategy.setPermissionFactory(CustomPermissionFactory())
        strategy.setAclClassIdSupported(true)
        return strategy;
    }

    @Bean
    open fun aclService(): AclService {
        val jdbcMutableAclService = JdbcMutableAclService(dataSource, lookupStrategy(), aclCache())
        jdbcMutableAclService.setAclClassIdSupported(true)
        jdbcMutableAclService.setClassIdentityQuery("select currval(pg_get_serial_sequence('acl_class', 'id'))")
        jdbcMutableAclService.setSidIdentityQuery("select currval(pg_get_serial_sequence('acl_sid', 'id'))")
        return jdbcMutableAclService
    }

}
