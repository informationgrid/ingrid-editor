package de.ingrid.igeserver.configuration

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity
import org.springframework.security.config.annotation.method.configuration.GlobalMethodSecurityConfiguration


@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
class AclMethodSecurityConfiguration : GlobalMethodSecurityConfiguration() {

    /*@Autowired
    lateinit var igePermissionEvaluator: CustomPermissionEvaluator

    override fun createExpressionHandler(): MethodSecurityExpressionHandler {
        val expressionHandler = DefaultMethodSecurityExpressionHandler()
        expressionHandler.setPermissionEvaluator(igePermissionEvaluator)
        return expressionHandler
    }*/

    @Autowired
    var defaultMethodSecurityExpressionHandler: MethodSecurityExpressionHandler? = null

    override fun createExpressionHandler(): MethodSecurityExpressionHandler? {
        return defaultMethodSecurityExpressionHandler
    }

}