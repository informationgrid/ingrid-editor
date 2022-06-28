package de.ingrid.igeserver.services

import de.ingrid.igeserver.tasks.quartz.URLChecker
import org.quartz.JobBuilder
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.quartz.SchedulerFactoryBean
import org.springframework.stereotype.Service
import javax.annotation.PostConstruct

@Service
class SchedulerService @Autowired constructor(val factory: SchedulerFactoryBean) {

    val scheduler = factory.scheduler

    @PostConstruct
    fun init() = create()

    fun start(jobKey: JobKey) {
        scheduler.triggerJob(jobKey)
    }

    fun stop(jobId: String) {

    }

    fun resume(jobId: String) {

    }

    fun getJobInfo(jobId: String) {

    }

    private fun create() {
        val detail = JobBuilder.newJob().ofType(URLChecker::class.java)
            .withIdentity(URLChecker.jobKey)
            .withDescription("Checking URLs for reachability")
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

    fun getJobKeyFromId(id: String): JobKey {
        id.split(":").apply {
            return JobKey.jobKey(this[1], this[0])
        }
    }
}