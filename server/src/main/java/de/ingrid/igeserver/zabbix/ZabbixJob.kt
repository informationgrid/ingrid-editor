package de.ingrid.igeserver.zabbix

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.tasks.quartz.IgeJob
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Component
@PersistJobDataAfterExecution
@Profile("zabbix")
class ZabbixJob @Autowired constructor(
    val zabbixService: ZabbixService
) : IgeJob() {

    companion object {
        const val jobKey: String = "zabbix-job"
    }

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: ZabbixJob")
        val info = prepareJob(context)

        zabbixService.addOrUpdateVerfahren(info.data)
        log.debug("Task finished: ZabbixJob for '$info.catalogId'")
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

