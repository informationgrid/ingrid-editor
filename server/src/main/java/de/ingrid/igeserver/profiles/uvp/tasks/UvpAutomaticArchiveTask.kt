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
package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveMessage
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveNotifier
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.runAsAdmin
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.JobKey
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.time.OffsetDateTime
import java.util.Date

@Component
@PersistJobDataAfterExecution
class UvpAutomaticArchiveTask(
    private val transactionManager: PlatformTransactionManager,
    private val uvpArchiveService: UvpArchiveService,
    private val documentService: DocumentService,
    private val catalogService: CatalogService,
    private val behaviourService: BehaviourService,
    private val notify: ArchiveNotifier,
) : IgeJob() {
    override val log = logger()

    companion object {
        const val JOB_KEY = "uvp-automatic-archive"
        const val JOB_GROUP = "uvp"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Automatic-Archive")
        catalogService.getCatalogs().forEach { catalog ->
            val config = behaviourService.getData(catalog.identifier, "plugin.uvp.archive")
                ?: return@forEach
            val automaticArchiveEnabled = config["automaticArchiveEnabled"] as? Boolean ?: false
            val months = (config["archiveAfterMonths"] as? Number)?.toLong()
            if (!automaticArchiveEnabled || months == null || months < 1) return@forEach

            archiveCatalog(context, catalog.identifier, OffsetDateTime.now().minusMonths(months))
        }
        log.info("Task finished: UVP-Automatic-Archive")
    }

    private fun archiveCatalog(context: JobExecutionContext, catalogId: String, date: OffsetDateTime) {
        val message = ArchiveMessage(catalogId)
        notify.sendMessage(message.apply { this.message = "Start automatic archiving for catalog: $catalogId" })
        val datasets = try {
            uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)
        } catch (exception: Exception) {
            message.errors += "Could not find datasets: ${exception.message}"
            message.endTime = Date()
            finishJob(context, message)
            notify.sendMessage(message)
            return
        }

        val archivedDatasetIds = mutableListOf<Int>()
        message.report = archivedDatasetIds
        runAsAdmin("UVPAutoArchive", "Task") { principal ->
            datasets.forEach { dataset ->
                try {
                    ClosableTransaction(transactionManager).use {
                        documentService.archiveDocument(principal, catalogId, dataset.wrapperId)
                    }
                    message.progress++
                    archivedDatasetIds += dataset.wrapperId
                    notify.sendMessage(message)
                } catch (exception: Exception) {
                    message.errors += "Could not archive dataset ${dataset.wrapperId}: ${exception.message}"
                    log.error("Could not archive dataset ${dataset.wrapperId} in catalog $catalogId", exception)
                    notify.sendMessage(message)
                }
            }
        }

        message.endTime = Date()
        finishJob(context, message)
        notify.sendMessage(message)
    }
}

@Component
class UvpAutomaticArchiveScheduler(
    private val scheduler: SchedulerService,
    @Value("\${uvp.archive.schedule}") private val schedule: String,
) {
    @EventListener(ApplicationReadyEvent::class)
    fun schedule() {
        scheduler.scheduleByCron(
            JobKey.jobKey(UvpAutomaticArchiveTask.JOB_KEY, UvpAutomaticArchiveTask.JOB_GROUP),
            UvpAutomaticArchiveTask::class.java,
            "",
            schedule,
        )
    }
}
