package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("zabbix")
data class ZabbixProperties(
        val detailURLTemplate: String,
        val uploadURL: String,
        val apiURL: String,
        val apiKey: String,
        val catalogs: List<String>?,
        val checkDelay: String,
        val checkCount: Int
)
