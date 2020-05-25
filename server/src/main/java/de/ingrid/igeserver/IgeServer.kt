package de.ingrid.igeserver

import org.apache.logging.log4j.LogManager
import org.springframework.boot.SpringApplication
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.scheduling.annotation.EnableScheduling


@SpringBootApplication
@EnableScheduling
class IgeServer

private val log = LogManager.getLogger(IgeServer::class.java)

fun main(args: Array<String>) {
    log.info("Starting application")
    SpringApplication(IgeServer::class.java).run(*args)

}
