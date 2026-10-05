/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.uvp.tasks.UvpAutomaticArchiveTask
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.BehavioursUpdatedEvent
import de.ingrid.igeserver.services.SchedulerService
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Service

@Service
class UvpArchiveSchedulerService(
    private val schedulerService: SchedulerService,
    private val behaviourService: BehaviourService,
    private val catalogRepo: CatalogRepository,
    @Value("\${uvp.archive.schedule:0 0 2 * * ?}")
    private val cronPattern: String,
) {
    private val log = logger()

    @EventListener(ApplicationReadyEvent::class)
    fun onApplicationReady() {
        try {
            catalogRepo.findAllByType("uvp").forEach { catalog ->
                updateSchedule(catalog.identifier)
            }
        } catch (e: Exception) {
            log.error("Failed to initialize UVP automatic archive schedules", e)
        }
    }

    @EventListener
    fun onBehavioursUpdated(event: BehavioursUpdatedEvent) {
        try {
            val catalog: Catalog = catalogRepo.findByIdentifier(event.catalogId)
            if (catalog.type == "uvp") {
                updateSchedule(event.catalogId)
            }
        } catch (e: Exception) {
            log.error("Failed to update UVP automatic archive schedule for catalog '${event.catalogId}'", e)
        }
    }

    fun updateSchedule(catalogId: String) {
        val jobKey = JobKey.jobKey(UvpAutomaticArchiveTask.JOB_KEY, catalogId)
        val config = behaviourService.getData(catalogId, "plugin.uvp.archive")
        val automaticArchiveEnabled = config?.get("automaticArchiveEnabled") as? Boolean == true

        if (automaticArchiveEnabled) {
            log.info("Scheduling automatic archive for catalog '$catalogId' with cron '$cronPattern'")
            schedulerService.scheduleByCron(jobKey, UvpAutomaticArchiveTask::class.java, catalogId, cronPattern)
        } else {
            log.info("Removing automatic archive schedule for catalog '$catalogId'")
            schedulerService.scheduleByCron(jobKey, UvpAutomaticArchiveTask::class.java, catalogId, "")
        }
    }
}
