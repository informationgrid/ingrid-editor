package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("mail")
data class MailProperties(
    val from: String,
    val subject: String,
    val subjectDatasetWillExpire: String,
    val subjectDatasetIsExpired: String,
    val subjectDeleteUser: String,
    val subjectResetPassword: String,
    val body: String,
    val bodyDeleteUser: String,
    val bodyWithPassword: String,
    val bodyResetPassword: String
)
