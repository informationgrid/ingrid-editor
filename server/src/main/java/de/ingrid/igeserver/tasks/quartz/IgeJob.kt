package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.imports.ImportMessage
import org.apache.logging.log4j.kotlin.KotlinLogger
import org.apache.logging.log4j.kotlin.logger
import org.quartz.InterruptableJob
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import java.util.Date

abstract class IgeJob: InterruptableJob {
    
    abstract val log : KotlinLogger

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

    protected fun finishJob(context: JobExecutionContext, startTime: Date, endTime: Date?, report: Any? = null, errors: List<Any> = emptyList()) {

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = startTime
        persistData["endTime"] = endTime
        persistData["report"] = jacksonObjectMapper().writeValueAsString(report)
        persistData["errors"] = jacksonObjectMapper().writeValueAsString(errors)

        currentThread = null
    }


    protected fun runAsUser(): Authentication {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Importer", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
        return auth
    }


}