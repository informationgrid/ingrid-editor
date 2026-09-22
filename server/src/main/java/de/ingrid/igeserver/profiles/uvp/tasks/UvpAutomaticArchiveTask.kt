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
import de.ingrid.igeserver.profiles.uvp.messaging.ArchivedDatasetInfo
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.runAsAdmin
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.util.*

@Component
@PersistJobDataAfterExecution
class UvpAutomaticArchiveTask(
    private val transactionManager: PlatformTransactionManager,
    private val uvpArchiveService: UvpArchiveService,
    private val documentService: DocumentService,
    private val behaviourService: BehaviourService,
    private val notify: ArchiveNotifier,
) : IgeJob() {
    override val log = logger()
    private val berlinZone = ZoneId.of("Europe/Berlin")

    companion object {
        const val JOB_KEY = "uvp-automatic-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Automatic-Archive")
        val catalogId = context.mergedJobDataMap?.getString("catalogId")
            ?: context.jobDetail?.key?.group?.takeIf { it != "DEFAULT" && it.isNotBlank() }!!
        val config = behaviourService.getData(catalogId, "plugin.uvp.archive")
            ?: return
        val automaticArchiveEnabled = config["automaticArchiveEnabled"] as? Boolean ?: false
        val months = (config["archiveAfterMonths"] as? Number)?.toLong() ?: 2
        if (!automaticArchiveEnabled || months < 1) return

        val today = LocalDate.now(berlinZone).atStartOfDay(berlinZone).toOffsetDateTime()
        archiveCatalog(context, catalogId, today.minusMonths(months))
        log.info("Task finished: UVP-Automatic-Archive")
    }

    private fun archiveCatalog(context: JobExecutionContext, catalogId: String, date: OffsetDateTime) {
        val message = ArchiveMessage(catalogId, automatic = true)
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

        val archivedDatasets = mutableListOf<ArchivedDatasetInfo>()
        message.report = archivedDatasets
        runAsAdmin("UVPAutoArchive", "Task") { principal ->
            datasets.forEach { dataset ->
                try {
                    val docData = ClosableTransaction(transactionManager).use {
                        documentService.archiveDocument(principal, catalogId, dataset.wrapperId)
                    }
                    message.progress++
                    archivedDatasets += ArchivedDatasetInfo(
                        id = dataset.wrapperId,
                        docId = docData.document.id,
                        uuid = docData.document.uuid,
                        title = docData.document.title,
                        type = docData.document.type,
                    )
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
