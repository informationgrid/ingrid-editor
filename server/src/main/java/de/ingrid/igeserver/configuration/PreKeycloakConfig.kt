package de.ingrid.igeserver.configuration

import org.keycloak.adapters.springboot.KeycloakSpringBootConfigResolver
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
open class PreKeycloakConfig {
    /**
     * Use properties in application.properties instead of keycloak.json
     */
    @Bean
    open fun keycloakConfigResolver(): KeycloakSpringBootConfigResolver {
        return KeycloakSpringBootConfigResolver()
    }
}
