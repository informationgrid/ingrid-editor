package de.ingrid.igeserver.api

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.model.Job
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.model.JobInfo
import de.ingrid.igeserver.profiles.ingrid.tasks.UpdateExternalCoupledResourcesTask
import de.ingrid.igeserver.profiles.uvp.tasks.RemoveUnreferencedDocsTask
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.services.SchedulerService
import de.ingrid.igeserver.tasks.UploadCleanupTask
import de.ingrid.igeserver.tasks.quartz.ImportTask
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
import java.security.Principal
import kotlin.io.path.absolutePathString

@RestController
@RequestMapping(path = ["/api"])
class JobsApiController @Autowired constructor(
    val catalogService: CatalogService,
    val scheduler: SchedulerService,
    val referenceHandlerFactory: ReferenceHandlerFactory,
    val urlRequestService: UrlRequestService,
    val aclService: IgeAclService
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
            getString("report")?.let { 
                put("report", jacksonObjectMapper().readValue(it, Any::class.java))
            }
            getString("errors")?.let {
                put("errors", jacksonObjectMapper().readValue(it, List::class.java))
            }
            getString("infos")?.let {
                put("infos", jacksonObjectMapper().readValue(it, List::class.java))
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
            put("groupDocIds", aclService.getDocumentIdsForGroups(principal).joinToString(","))
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

        val tempFile = kotlin.io.path.createTempFile("import-", "-${file.originalFilename}")
        log.info("Save uploaded file to '${tempFile.absolutePathString()}'")
        file.transferTo(tempFile)

        val jobDataMap = JobDataMap().apply {
            put("profile", profile)
            put("catalogId", catalogId)
            put("importFile", tempFile.absolutePathString())
            put("report", null)
        }
        scheduler.handleJobWithCommand(command, ImportTask::class.java, jobKey, jobDataMap)

        return ResponseEntity.ok().build()
    }

    override fun importTask(principal: Principal, command: JobCommand, options: ImportOptions): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val profile = catalogService.getCatalogById(catalogId).type
        val jobKey = JobKey.jobKey(ImportService.jobKey, catalogId)

        val jobDataMap = JobDataMap().apply {
            put("profile", profile)
            put("catalogId", catalogId)
            put("options", jacksonObjectMapper().writeValueAsString(options))
        }
        scheduler.handleJobWithCommand(command, ImportTask::class.java, jobKey, jobDataMap)

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


    @Autowired(required = false)
    var uploadCleanupTask: UploadCleanupTask? = null
    override fun cleanupUploads(principal: Principal): ResponseEntity<Unit> {
        if (uploadCleanupTask == null) throw ServerException.withReason("RemoveUnreferencedDocsTask not available")

        uploadCleanupTask?.cleanup()
        return ResponseEntity.ok().build()
    }

    @Autowired(required = false)
    var removeUnreferencedDocsTask: RemoveUnreferencedDocsTask? = null
    override fun removeUnreferencedDocuments(principal: Principal): ResponseEntity<List<String>> {
        if (removeUnreferencedDocsTask == null) throw ServerException.withReason("RemoveUnreferencedDocsTask not available")
        
        val result = removeUnreferencedDocsTask?.start() ?: emptyList()
        return ResponseEntity.ok(result)
    }

    @Autowired(required = false)
    var updateExternalCoupledResourcesTask: UpdateExternalCoupledResourcesTask? = null
    override fun updateExternalCoupledResources(principal: Principal): ResponseEntity<String> {
        if (updateExternalCoupledResourcesTask == null) throw ServerException.withReason("UpdateExternalCoupledResourcesTask not available")
        
        val result = updateExternalCoupledResourcesTask?.updateExternalCoupledResources() ?: ""
        return ResponseEntity.ok(result)
    }
}
