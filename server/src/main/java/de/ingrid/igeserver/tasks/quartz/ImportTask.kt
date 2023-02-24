package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.imports.ImportMessage
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import org.apache.logging.log4j.kotlin.logger
import org.quartz.InterruptableJob
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component

enum class ImportState {
    BEFORE_ANALYZE, AFTER_ANALYZE
}

@Component
@PersistJobDataAfterExecution
class ImportAnalyzeTask @Autowired constructor(
    val notifier: JobsNotifier,
    val importService: ImportService
) : InterruptableJob {

    private val log = logger()

    var currentThread: Thread? = null

    val notificationType = MessageTarget(NotificationType.IMPORT)

    override fun execute(context: JobExecutionContext) {
        log.info("Starting Task: Import")
        val info = prepareJob(context)

        val message = ImportMessage()
        notificationType.catalogId = info.catalogId
        notifier.sendMessage(notificationType, message.apply { this.message = "Started Import Analyzer" })

        val principal = runAsUser()

        if (info.importFile != null) {
            val analysis = importService.analyzeFile(info.catalogId, info.importFile)
            finishJobAnalysis(message, context, analysis)
        } else if (info.analysis != null) {
            importService.importAnalyzedDatasets(principal, info.catalogId, info.analysis)
            finishJobImport(message, context)
        }

        log.debug("Task finished: Import for '$info.catalogId'")
    }

    private fun finishJobImport(message: ImportMessage, context: JobExecutionContext) {
        notifier.endMessage(notificationType, message.apply {
            this.message = "Finished Import"
            this.errors = errors
        })

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["errors"] = jacksonObjectMapper().writeValueAsString(message.errors)

        currentThread = null
    }

    private fun finishJobAnalysis(
        message: ImportMessage,
        context: JobExecutionContext,
        analysis: Any,
        errors: MutableList<String> = mutableListOf()
    ) {
        notifier.endMessage(notificationType, message.apply {
            this.message = "Finished Import"
//            this.report = analysis
//            this.errors = errors
        })

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["report"] = jacksonObjectMapper().writeValueAsString(analysis)
        persistData["errors"] = jacksonObjectMapper().writeValueAsString(message.errors)

        currentThread = null
    }
    
    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")

        val importFile: String? = dataMap.getString("importFile")
        val report = dataMap.getString("report")
        val analysis: OptimizedImportAnalysis? = if (report != null) jacksonObjectMapper().readValue(report) else null

        notificationType.catalogId = catalogId
        currentThread = Thread.currentThread()

        return JobInfo(profile, catalogId, importFile, analysis)
    }

    private fun runAsUser(): Authentication {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Importer", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
        return auth
    }

    data class JobInfo(
        val profile: String,
        val catalogId: String,
        val importFile: String?,
        val analysis: OptimizedImportAnalysis?
    )

    data class ImportReport(
        val importer: String,
        val numDatasets: Int,
        val numAddresses: Int,
        val existingDatasets: List<DatasetInfo>,
        val existingAddresses: List<DatasetInfo>,
    )

}