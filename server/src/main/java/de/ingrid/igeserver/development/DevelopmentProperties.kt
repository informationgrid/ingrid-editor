package de.ingrid.igeserver.development

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Profile("dev")
@ConstructorBinding
@ConfigurationProperties("dev.user")
data class DevelopmentProperties(
    val logins: List<String>?,
    val firstName: List<String>?,
    val lastName: List<String>?,
    val currentUser: Int = 0
)