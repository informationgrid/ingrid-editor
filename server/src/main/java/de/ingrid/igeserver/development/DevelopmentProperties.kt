package de.ingrid.igeserver.development

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Profile

@Profile("dev")
@ConfigurationProperties("dev.user")
data class DevelopmentProperties(
    val logins: List<String>?,
    val firstName: List<String>?,
    val lastName: List<String>?,
    val currentUser: Int = 0,
)
