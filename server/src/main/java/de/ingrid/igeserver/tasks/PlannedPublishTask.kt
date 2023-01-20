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
