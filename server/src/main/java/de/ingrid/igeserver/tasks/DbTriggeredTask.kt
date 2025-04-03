/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager

@Component
abstract class DbTriggeredTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
) {
    val log = logger()
    abstract val taskKey: String

    abstract fun executeTaskOnCatalog(catalogIdentifier: String)

    // this ensures that the task is executed after the initial db migrations
    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogIdentifiers = getCatalogsForForTask()
        if (catalogIdentifiers.isEmpty()) return

        setAdminAuthentication(taskKey, "Task")

        catalogIdentifiers.forEach { catalogIdentifier ->
            log.info("Execute $taskKey Task for catalog: $catalogIdentifier")
            ClosableTransaction(transactionManager).use {
                executeTaskOnCatalog(catalogIdentifier)
                removeTaskFlag(catalogIdentifier)
                log.info("Finished $taskKey for catalog: $catalogIdentifier")
            }
        }
    }

    fun getCatalogsForForTask(): List<String> = try {
        entityManager
            .createQuery(
                "SELECT version FROM VersionInfo version WHERE version.key = '$taskKey'",
                VersionInfo::class.java,
            )
            .resultList
            .map { it.value!! }
    } catch (e: Exception) {
        log.warn("Could not query version_info table")
        log.debug("Error: ", e)
        emptyList()
    }

    fun removeTaskFlag(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = '$taskKey' AND version.value = '$catalogIdentifier'",
            )
            .executeUpdate()
    }
}
