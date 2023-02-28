package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
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
class ImportTask @Autowired constructor(
    val notifier: JobsNotifier,
    val importService: ImportService
) : IgeJob() {

    override val log = logger()

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Import")
        val info = prepareJob(context)
        val notificationType = MessageTarget(NotificationType.IMPORT, info.catalogId)
        val stage = if (info.importFile != null) "ANALYZE" else if (info.analysis != null) "IMPORT" else "UNKNOWN"

        // use start time from analysis phase if it already happened
        val message = if (stage == "ANALYZE") Message() else Message(info.startTime ?: Date())
        notifier.sendMessage(notificationType, message.apply { this.message = "Started Import-Task" })

        val principal = runAsUser()

        val report = when (stage) {
            "ANALYZE" -> {
                clearPreviousAnalysis(context)
                importService.analyzeFile(info.catalogId, info.importFile!!, message)
            }
            "IMPORT" -> {
                importService.importAnalyzedDatasets(principal, info.catalogId, info.analysis!!, info.options!!, message)
                info.analysis
            }
            else -> null
        }

        with(message) {
            val jobInfo = IgeJobInfo(this.startTime, Date(), report, stage = stage)
            finishJob(context, jobInfo)
            notifier.endMessage(notificationType, jobInfo)
        }

        log.debug("Task finished: Import for '$info.catalogId'")
    }

    private fun clearPreviousAnalysis(context: JobExecutionContext) {
        context.mergedJobDataMap!!.run {
            put("startTime", Date())
            put("endTime", null)
            put("report", null)
            put("errors", null)
        }
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        context.mergedJobDataMap!!.run {
            val startTime: Date? = get("startTime") as Date?
            val profile = getString("profile")
            val catalogId: String = getString("catalogId")
            val importFile: String? = getString("importFile")
            val report: OptimizedImportAnalysis? = getString("report")?.let { jacksonObjectMapper().readValue(it) }
            val options: ImportOptions? = getString("options")?.let { jacksonObjectMapper().readValue(it) }

            return JobInfo(startTime, profile, catalogId, importFile, report, options)
        }
    }

    data class JobInfo(
        val startTime: Date?,
        val profile: String,
        val catalogId: String,
        val importFile: String?,
        val analysis: OptimizedImportAnalysis?,
        val options: ImportOptions?
    )
}