package de.ingrid.igeserver.api

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.messaging.URLCheckerReport
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.model.Job
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.model.JobInfo
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.quartz.ImportAnalyzeTask
import de.ingrid.igeserver.tasks.quartz.URLChecker
import de.ingrid.igeserver.tasks.quartz.UrlRequestService
import de.ingrid.igeserver.utils.ReferenceHandlerFactory
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobDataMap
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.nio.file.Files
import java.nio.file.Path
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class JobsApiController @Autowired constructor(
    val catalogService: CatalogService,
    val scheduler: SchedulerService,
    val referenceHandlerFactory: ReferenceHandlerFactory,
    val urlRequestService: UrlRequestService
) : JobsApi {

    val log = logger()

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
        val jobDataMap = scheduler.getJobDetail(id, catalogId)?.jobDataMap?.apply {
            val report = getString("report")
            if (report != null) {
                put("report", jacksonObjectMapper().readValue(report, Any::class.java))
            }
            val errors = getString("errors")
            if (errors != null) {
                put("errors", jacksonObjectMapper().readValue(errors, List::class.java))
            }
        }
        return ResponseEntity.ok(JobInfo(isRunning, jobDataMap))
    }

    override fun urlCheckTask(principal: Principal, command: JobCommand): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val profile = catalogService.getCatalogById(catalogId).type
        val jobKey = JobKey.jobKey(URLChecker.jobKey, catalogId)

        val jobDataMap = JobDataMap().apply {
            put("profile", profile)
            put("catalogId", catalogId)
        }
        scheduler.handleJobWithCommand(command, URLChecker::class.java, jobKey, jobDataMap)
        return ResponseEntity.ok().build()
    }

    override fun importAnalyzeTask(
        principal: Principal,
        file: MultipartFile,
        command: JobCommand
    ): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val profile = catalogService.getCatalogById(catalogId).type
        val jobKey = JobKey.jobKey(ImportService.jobKey, catalogId)

        val fileLocation = "/tmp/ige-ng/importFiles/${file.originalFilename}"
        log.info("Save uploaded file to '${fileLocation}'")
        Files.createDirectories(Path.of("/tmp/ige-ng/importFiles"))
        file.transferTo(File(fileLocation))

        val jobDataMap = JobDataMap().apply {
            put("profile", profile)
            put("catalogId", catalogId)
            put("importFile", fileLocation)
            put("report", null)
        }
        scheduler.handleJobWithCommand(command, ImportAnalyzeTask::class.java, jobKey, jobDataMap)

        return ResponseEntity.ok().build()
    }

    override fun importTask(principal: Principal, command: JobCommand): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val profile = catalogService.getCatalogById(catalogId).type
        val jobKey = JobKey.jobKey(ImportService.jobKey, catalogId)

        val jobDataMap = JobDataMap().apply {
            put("profile", profile)
            put("catalogId", catalogId)
        }
        scheduler.handleJobWithCommand(command, ImportAnalyzeTask::class.java, jobKey, jobDataMap)

        return ResponseEntity.ok().build()
    }

    @Transactional
    override fun replaceUrl(principal: Principal, data: UrlReplaceData): ResponseEntity<Map<String, Any>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val profile = catalogService.getCatalogById(catalogId).type

        val referenceHandler = referenceHandlerFactory.get(profile)
            ?: throw ClientException.withReason("No reference handler found for profile $profile")
        val docsNumberUpdated = referenceHandler.replaceUrl(catalogId, data.source, data.replaceUrl)
        val status = urlRequestService.getStatus(data.replaceUrl)

        return ResponseEntity.ok(
            mapOf(
                "status" to status,
                "urlValid" to urlRequestService.isSuccessCode(status),
                "docsUpdated" to docsNumberUpdated
            )
        )
    }


}
