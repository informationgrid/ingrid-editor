/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.tasks.quartz.IgeJob
import de.ingrid.igeserver.utils.setAdminAuthentication
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.time.OffsetDateTime
import java.util.*

@Component
@PersistJobDataAfterExecution
class UvpArchiveTask(
    val transactionManager: PlatformTransactionManager,
    val uvpArchiveService: UvpArchiveService,
    val documentService: DocumentService,
    val notify: ArchiveNotifier,
) : IgeJob() {
    override val log = logger()

    companion object {
        const val JOB_KEY: String = "uvp-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Archive")
        val date = OffsetDateTime.parse(context.mergedJobDataMap["date"] as String)
        val catalogId = context.mergedJobDataMap["catalogId"] as String

        val message = ArchiveMessage(catalogId)
        notify.sendMessage(
            message.apply { this.message = "Start Indexing for catalog: $catalogId" },
        )

        // get all docs whose decision date is before a given date
        val datasets = uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)

        val principal = setAdminAuthentication("UVPArchive", "Task")

        ClosableTransaction(transactionManager).use {
            datasets.forEach {
                documentService.archiveDocument(principal, catalogId, it.wrapperId)
                notify.sendMessage(
                    message.apply { this.progress++ },
                )
            }
        }

        notify.sendMessage(
            message.apply { this.endTime = Date() },
        )
    }
}
