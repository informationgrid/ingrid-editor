package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.messaging.Message
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.quartz.InterruptableJob
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import java.util.*

abstract class IgeJob : InterruptableJob {

    abstract val log: KotlinLogger

    var currentThread: Thread? = null

    abstract fun run(context: JobExecutionContext)

    override fun execute(context: JobExecutionContext) {
        currentThread = Thread.currentThread()
        run(context)
    }

    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    protected fun finishJob(
        context: JobExecutionContext,
        jobInfo: Message
    ): JobDataMap {
        currentThread = null

        return context.jobDetail?.jobDataMap!!.apply {
            put("startTime", jobInfo.startTime)
            put("endTime", jobInfo.endTime)
            put("report", jacksonObjectMapper().writeValueAsString(jobInfo.report))
            put("errors", jacksonObjectMapper().writeValueAsString(jobInfo.errors))
            put("stage", jobInfo.stage)
        }

    }


    protected fun runAsUser(): Authentication {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Importer", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
        return auth
    }
}
