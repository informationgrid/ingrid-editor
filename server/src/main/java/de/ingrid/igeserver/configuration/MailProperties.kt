package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("mail")
data class MailProperties(
    val from: String,
    val subject: String,
    val body: String,
    val bodyWithPassword: String,
    val subjectResetPassword: String,
    val bodyResetPassword: String
)
