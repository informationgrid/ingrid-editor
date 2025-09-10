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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.quartz.MigrateCodelistIdsIntoDatasets
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobKey
import org.springframework.stereotype.Service

/**
 * Migrate codelist IDs into entries of each dataset. After migration a synchronisation is
 * started to write the value of the corresponding key.
 */
@Service
class M095MigrateCodelistValues(val scheduler: SchedulerService, val catalogService: CatalogService) : MigrationBase("0.95") {

    private var log = logger()

//    @Autowired
//    lateinit var entityManager: EntityManager

//    @Autowired
//    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {}

    override fun postExec() {
        /*ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")
            val removed = entityManager.createNativeQuery("""DELETE FROM qrtz_cron_triggers WHERE trigger_name='index'""")
                .executeUpdate()
            entityManager.createNativeQuery("""DELETE FROM qrtz_triggers WHERE trigger_name='index'""")
                .executeUpdate()
            log.info("""$removed cron triggers removed""")
        }*/

        catalogService.getCatalogs().forEach { catalog ->
            val jobKey = JobKey.jobKey(MigrateCodelistIdsIntoDatasets.JOB_KEY, catalog.identifier)
            val jobDataMap = JobDataMap().apply {
                this.put("catalogId", catalog.identifier)
            }
            scheduler.handleJobWithCommand(
                JobCommand.start,
                MigrateCodelistIdsIntoDatasets::class.java,
                jobKey,
                jobDataMap,
            )
        }
    }
}
