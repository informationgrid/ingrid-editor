package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("app")
data class GeneralProperties(
    val uuid: String,
    val enableCsrf: Boolean,
    val enableCors: Boolean,
    val enableHttps: Boolean,
    val markInsteadOfDelete: Boolean,
    val host: String,
    val externalHelp: String?,
    val instanceId: String = "ige-ng"
)
