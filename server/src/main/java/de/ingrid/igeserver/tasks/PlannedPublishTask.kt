/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

@Component
class PlannedPublishTask(val documentService: DocumentService, val catalogService: CatalogService) {
    val log = logger()

    // this ensures that the post migration task is executed after the initial db migrations
    @EventListener(ApplicationReadyEvent::class)
    fun onReady() {
        plannedPublishTask()
    }

    @Scheduled(cron = "\${cron.publish.expression}")
    fun plannedPublishTask() {
        log.info("Starting Task: Planned-Publish")
        val principal = getAuthentication()

        catalogService.getCatalogs().forEach { documentService.publishPendingDocuments(principal, it.identifier) }
        log.info("Task finished: Planned-Publish")
    }


    private fun getAuthentication(): Authentication {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "Scheduler",
                "Task",
                listOf(
                    SimpleGrantedAuthority("cat-admin"),
                    SimpleGrantedAuthority("ROLE_ACL_ACCESS"), // needed for ACL changes
                )
            )
        SecurityContextHolder.getContext().authentication = auth
        return auth
    }
}
