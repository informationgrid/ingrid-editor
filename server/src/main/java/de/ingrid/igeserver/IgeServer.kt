package de.ingrid.igeserver

import de.ingrid.igeserver.configuration.BeansConfiguration
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.configuration.MailProperties
import de.ingrid.igeserver.configuration.ZabbixProperties
import de.ingrid.igeserver.development.DevelopmentProperties
import de.ingrid.mdek.upload.configuration.SpringConfiguration
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.cache.annotation.EnableCaching
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.scheduling.annotation.EnableScheduling

@Configuration
@EnableAutoConfiguration
@EnableConfigurationProperties(
    DevelopmentProperties::class,
    MailProperties::class,
    ZabbixProperties::class,
    GeneralProperties::class
)
@Import(value = [BeansConfiguration::class, SpringConfiguration::class])
@EnableScheduling
@EnableCaching
class IgeServer

//private companion object {
//        private val log = LogManager.getLogger()
//    }

fun main(args: Array<String>) {
//    log.info("Starting application")
    SpringApplication(IgeServer::class.java).run(*args)
}
