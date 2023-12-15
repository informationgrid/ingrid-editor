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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.model.JobCommand
import org.apache.logging.log4j.kotlin.logger
import org.quartz.*
import org.quartz.Trigger.DEFAULT_PRIORITY
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.quartz.SchedulerFactoryBean
import org.springframework.stereotype.Service

@Service
class SchedulerService(val factory: SchedulerFactoryBean) {
    val log = logger()

    private val scheduler = factory.scheduler

    fun start(jobKey: JobKey, jobDataMap: JobDataMap?, jobPriority: Int, checkRunning: Boolean) {
        if (checkRunning) {
            val isRunning = scheduler.currentlyExecutingJobs.any { it.jobDetail.key == jobKey }
            if (isRunning) {
                log.info("Job is already running. Skip execution")
                return
            }
        }
        val trigger = TriggerBuilder.newTrigger().forJob(jobKey)
            .usingJobData(jobDataMap)
            .withPriority(jobPriority)
            .build()

        scheduler.scheduleJob(trigger)
    }

    fun pause(jobId: String) {

    }

    fun resume(jobId: String) {

    }

    fun cancel(jobId: String) {

    }

    fun getJobInfo(jobKey: JobKey): JobDetail {
        return scheduler.getJobDetail(jobKey)
    }

    private fun createJob(jobClass: Class<out Job>, jobKey: JobKey) {
        val detail = JobBuilder.newJob().ofType(jobClass)
            .withIdentity(jobKey)
//            .withDescription("Checking URLs for reachability")
            .storeDurably()
            .build()

        scheduler.addJob(detail, true)


        /*val trigger = TriggerBuilder.newTrigger().forJob("Qrtz_URLChecker")
            .withIdentity("Qrtz_URLCheckerTrigger")
            .withDescription("Trigger for running URL Checker")
            .withSchedule(SimpleScheduleBuilder.simpleSchedule().repeatForever().withIntervalInSeconds(5).withRepeatCount(3))
            .build()

        scheduler.scheduleJob(detail, trigger)
        scheduler.start()*/
    }

    fun getJobKeyFromId(id: String, catalogId: String): JobKey {
        id.split(":").apply {
            return JobKey.jobKey(this[1] + catalogId, this[0])
        }
    }

    fun handleJobWithCommand(
        command: JobCommand,
        jobClass: Class<out Job>,
        jobKey: JobKey,
        jobDataMap: JobDataMap? = null,
        jobPriority: Int = DEFAULT_PRIORITY,
        checkRunning: Boolean = true
    ) {

        when (command) {
            JobCommand.start -> {
                if (scheduler.checkExists(jobKey).not()) {
                    createJob(jobClass, jobKey)
                }
                start(jobKey, jobDataMap, jobPriority, checkRunning)
            }
            JobCommand.stop -> stop(jobKey)
            JobCommand.resume -> TODO()
        }
    }

    private fun stop(jobKey: JobKey) {
        with(scheduler) {
            interrupt(jobKey)
//            deleteJob(jobKey)
        }
    }

    fun isRunning(id: String, catalogId: String): Boolean {
        val jobKey = JobKey.jobKey(id, catalogId)
        return scheduler.currentlyExecutingJobs.any { it.jobDetail.key == jobKey }
    }

    fun getJobDetail(id: String, catalogId: String): JobDetail? {
        val jobKey = JobKey.jobKey(id, catalogId)
        return scheduler.getJobDetail(jobKey)
    }
}
