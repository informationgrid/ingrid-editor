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
package de.ingrid.igeserver.zabbix

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.tasks.quartz.IgeJob
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@PersistJobDataAfterExecution
@Profile("zabbix")
class ZabbixJob(
    val zabbixService: ZabbixService,
) : IgeJob() {

    companion object {
        const val jobKey: String = "zabbix-job"
    }

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        log.debug("Starting Task: ZabbixJob")
        val info = prepareJob(context)

        zabbixService.addOrUpdateDocument(info.data)
        log.debug("Task finished: ZabbixJob for '${info.catalogId}'")
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")
        val data: ZabbixModel.ZabbixData = dataMap.getString("data")!!.let { jacksonObjectMapper().readValue(it) }

        return JobInfo(profile, catalogId, data)
    }

    private data class JobInfo(val profile: String, val catalogId: String, val data: ZabbixModel.ZabbixData)
}
