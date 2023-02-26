package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.imports.ImportMessage
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*


@Component
@PersistJobDataAfterExecution
class ImportAnalyzeTask @Autowired constructor(
    val notifier: JobsNotifier,
    val importService: ImportService
) : IgeJob() {

    override val log = logger()

    val notificationType = MessageTarget(NotificationType.IMPORT)

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Import")
        val info = prepareJob(context)

        // use start time from analysis phase if it already happened
        val message = if (info.importFile != null) ImportMessage() else ImportMessage(info.startTime)
        notificationType.catalogId = info.catalogId
        notifier.sendMessage(notificationType, message.apply { this.message = "Started Import Analyzer" })

        val principal = runAsUser()

        val report = if (info.importFile != null) {
            clearPreviousAnalysis(context)
            importService.analyzeFile(info.catalogId, info.importFile)
        } else if (info.analysis != null) {
            importService.importAnalyzedDatasets(principal, info.catalogId, info.analysis)
            info.analysis
        } else null

        with(message) {
            notifier.endMessage(notificationType, this)
            finishJob(context, this.startTime, this.endTime, report)
        }

        log.debug("Task finished: Import for '$info.catalogId'")
    }

    private fun clearPreviousAnalysis(context: JobExecutionContext) {
        context.mergedJobDataMap!!.run {
            put("report", null)
            put("errors", null)
        }
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        context.mergedJobDataMap!!.run {
            val startTime: Date = get("startTime") as Date
            val profile = getString("profile")
            val catalogId: String = getString("catalogId")
            val importFile: String? = getString("importFile")
            val report: OptimizedImportAnalysis? = getString("report")?.let { jacksonObjectMapper().readValue(it) }
            notificationType.catalogId = catalogId

            return JobInfo(startTime, profile, catalogId, importFile, report)
        }
    }

    data class JobInfo(
        val startTime: Date,
        val profile: String,
        val catalogId: String,
        val importFile: String?,
        val analysis: OptimizedImportAnalysis?
    )
}