package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("app")
data class GeneralProperties(
    val uuid: String,
    val enableCsrf: Boolean,
    val enableCors: Boolean,
    val enableHttps: Boolean,
    val markInsteadOfDelete: Boolean,
    val host: String,
    val externalHelp: String?,
    val zabbixAPIKey: String?,
    val zabbixAPIURL: String?,
    val zabbixCatalogs: List<String>?,
    val zabbixDetailURL: String?,
    val zabbixUploadURL: String?,
    val instanceId: String = "ige-ng"
)
