package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.CustomPermissionFactory
import de.ingrid.igeserver.configuration.acl.IgeAclPermissionCacheOptimizer
import de.ingrid.igeserver.configuration.acl.IgeAclPermissionEvaluator
import de.ingrid.igeserver.utils.AuthUtils
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
class ACLContext {

    @Autowired
    var dataSource: DataSource? = null

    @Autowired
    lateinit var cacheManager: CacheManager

    @Bean
    fun aclCache(): SpringCacheBasedAclCache {
        return SpringCacheBasedAclCache(
                cacheManager.getCache("aclCache"),
                permissionGrantingStrategy(),
                aclAuthorizationStrategy()
        )
    }

    @Bean
    fun permissionGrantingStrategy(): PermissionGrantingStrategy {
        return DefaultPermissionGrantingStrategy(ConsoleAuditLogger())
    }

    @Bean
    fun aclAuthorizationStrategy(): AclAuthorizationStrategy {
        return AclAuthorizationStrategyImpl(SimpleGrantedAuthority("ROLE_ACL_ACCESS"))
    }

    @Bean
    fun defaultMethodSecurityExpressionHandler(authUtils: AuthUtils): MethodSecurityExpressionHandler? {
        val expressionHandler = DefaultMethodSecurityExpressionHandler()
        val permissionEvaluator = IgeAclPermissionEvaluator(aclService(), authUtils)
        expressionHandler.setPermissionEvaluator(permissionEvaluator)
        expressionHandler.setPermissionCacheOptimizer(IgeAclPermissionCacheOptimizer(aclService()))
        return expressionHandler
    }

    @Bean
    fun igeAclPermissionEvaluator(authUtils: AuthUtils): IgeAclPermissionEvaluator {
        return IgeAclPermissionEvaluator(aclService(), authUtils)
    }


    @Bean
    fun lookupStrategy(): LookupStrategy {
        val strategy = BasicLookupStrategy(dataSource, aclCache(), aclAuthorizationStrategy(), ConsoleAuditLogger())
        strategy.setPermissionFactory(CustomPermissionFactory())
        strategy.setAclClassIdSupported(true)
        return strategy
    }

    @Bean
    fun aclService(): AclService {
        val jdbcMutableAclService = JdbcMutableAclService(dataSource, lookupStrategy(), aclCache())
        jdbcMutableAclService.setAclClassIdSupported(true)
        jdbcMutableAclService.setClassIdentityQuery("select currval(pg_get_serial_sequence('acl_class', 'id'))")
        jdbcMutableAclService.setSidIdentityQuery("select currval(pg_get_serial_sequence('acl_sid', 'id'))")
        return jdbcMutableAclService
    }

}
