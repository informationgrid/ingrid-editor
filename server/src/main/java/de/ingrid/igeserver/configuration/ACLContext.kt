package de.ingrid.igeserver.configuration

import de.ingrid.igeserver.configuration.acl.CustomPermissionFactory
import de.ingrid.igeserver.configuration.acl.IgeAclPermissionEvaluator
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.cache.ehcache.EhCacheFactoryBean
import org.springframework.cache.ehcache.EhCacheManagerFactoryBean
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.acls.AclPermissionCacheOptimizer
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

    @Value("#{'\${spring.profiles.active:}'.indexOf('dev') != -1}")
    var developmentMode = false
    
    @Autowired
    var dataSource: DataSource? = null

    @Bean
    fun aclCache(): EhCacheBasedAclCache {
        return EhCacheBasedAclCache(
            aclEhCacheFactoryBean().getObject(),
            permissionGrantingStrategy(),
            aclAuthorizationStrategy()
        )
    }

    @Bean
    fun aclEhCacheFactoryBean(): EhCacheFactoryBean {
        val ehCacheFactoryBean = EhCacheFactoryBean()
        ehCacheFactoryBean.setCacheManager(aclCacheManager().getObject())
        ehCacheFactoryBean.setCacheName("aclCache")
        return ehCacheFactoryBean
    }

    @Bean
    fun aclCacheManager(): EhCacheManagerFactoryBean {
        return EhCacheManagerFactoryBean()
    }

    @Bean
    fun permissionGrantingStrategy(): PermissionGrantingStrategy {
        return DefaultPermissionGrantingStrategy(ConsoleAuditLogger())
    }

    @Bean
    fun aclAuthorizationStrategy(): AclAuthorizationStrategy {
        return AclAuthorizationStrategyImpl(SimpleGrantedAuthority("ROLE_GROUP_MANAGER"))
    }

    @Bean
    fun defaultMethodSecurityExpressionHandler(): MethodSecurityExpressionHandler? {
        val expressionHandler = DefaultMethodSecurityExpressionHandler()
        val permissionEvaluator = IgeAclPermissionEvaluator(aclService())
        expressionHandler.setPermissionEvaluator(permissionEvaluator)
        expressionHandler.setPermissionCacheOptimizer(AclPermissionCacheOptimizer(aclService()))
        return expressionHandler
    }


    @Bean
    fun lookupStrategy(): LookupStrategy {
        val strategy = BasicLookupStrategy(dataSource, aclCache(), aclAuthorizationStrategy(), ConsoleAuditLogger())
        strategy.setPermissionFactory(CustomPermissionFactory())
        strategy.setAclClassIdSupported(true)
        return strategy;
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