/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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

//private val log = logger()

fun main(args: Array<String>) {
//    log.info("Starting application")
    SpringApplication(IgeServer::class.java).run(*args)
}
