package de.ingrid.igeserver

import de.ingrid.igeserver.configuration.BeansConfiguration
import org.apache.logging.log4j.LogManager
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.scheduling.annotation.EnableScheduling

@Configuration
@EnableAutoConfiguration
@Import(BeansConfiguration::class)
@EnableScheduling
class IgeServer

private val log = LogManager.getLogger(IgeServer::class.java)

fun main(args: Array<String>) {
    log.info("Starting application")
    SpringApplication(IgeServer::class.java).run(*args)
}
