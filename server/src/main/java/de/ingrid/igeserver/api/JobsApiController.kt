package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Job
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.model.JobInfo
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.quartz.URLChecker
import org.quartz.JobDataMap
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class JobsApiController @Autowired constructor(
    val catalogService: CatalogService,
    val scheduler: SchedulerService
) : JobsApi {

    override fun getJobs(principal: Principal): ResponseEntity<Job> {
        TODO("Not yet implemented")
    }

    override fun isRunning(principal: Principal, id: String): ResponseEntity<Boolean> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isRunning = scheduler.isRunning(id, catalogId)
        return ResponseEntity.ok(isRunning)
    }

    override fun getInfo(principal: Principal, id: String): ResponseEntity<JobInfo> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isRunning = scheduler.isRunning(id, catalogId)
        val jobDataMap = scheduler.getJobDetail(id, catalogId)?.jobDataMap
        return ResponseEntity.ok(JobInfo(isRunning, jobDataMap))
    }

    override fun urlCheckTask(principal: Principal, command: JobCommand): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val jobKey = JobKey.jobKey(URLChecker.jobKey.name, catalogId)

        val jobDataMap = JobDataMap().apply { put("catalogId", catalogId) }
        scheduler.handleJobWithCommand(command, URLChecker::class.java, jobKey, jobDataMap)
        return ResponseEntity.ok().build()
    }


}