package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.nio.file.Files
import java.nio.file.Path
import java.util.*


@Component
@PersistJobDataAfterExecution
class ImportTask @Autowired constructor(
    val notifier: JobsNotifier,
    val importService: ImportService,
    val documentService: DocumentService,
    val catalogService: CatalogService,
) : IgeJob() {

    override val log = logger()

    enum class Stage { ANALYZE, IMPORT, UNKNOWN }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: Import")
        val info = prepareJob(context)
        val notificationType = MessageTarget(NotificationType.IMPORT, info.catalogId)
        val stage =
            if (info.importFile != null) Stage.ANALYZE else if (info.analysis != null) Stage.IMPORT else Stage.UNKNOWN

        // use start time from analysis phase if it already happened
        val message = if (stage == Stage.ANALYZE) Message() else Message(info.startTime ?: Date())
        try {
            notifier.sendMessage(notificationType, message.apply { this.message = "Started Import-Task" })

            val principal = runAsUser()

            val report = when (stage) {
                Stage.ANALYZE -> {
                    clearPreviousAnalysis(context)
                    importService.analyzeFile(info.catalogId, info.importFile!!, message)
                        .also { checkForValidDocumentsInProfile(info.catalogId, it) }
                        .also {
                            System.gc()    
                            Files.delete(Path.of(info.importFile)) 
                        }
                }

                Stage.IMPORT -> {
                    val counter = importService.importAnalyzedDatasets(
                        principal,
                        info.catalogId,
                        info.analysis!!,
                        info.options!!,
                        message
                    )
                    info.analysis.apply { this.importResult = counter }
                }

                else -> null
            }

            message.apply { this.report = report; this.endTime = Date(); this.stage = stage.name }.also {
                finishJob(context, it)
                notifier.sendMessage(notificationType, it)
            }

        } catch (ex: Exception) {
            message.apply {
                this.report = info.analysis; this.endTime = Date(); this.stage = stage.name; this.errors = mutableListOf(ex.message ?: ex.toString())
            }.also {
                finishJob(context, it)
                notifier.sendMessage(notificationType, it)
            }
            throw ex
        }

        log.debug("Task finished: Import for '$info.catalogId'")
    }

    private fun checkForValidDocumentsInProfile(catalogId: String, report: OptimizedImportAnalysis) {
        val documentTypesOfProfile = catalogService.getCatalogById(catalogId).type
            .let { catalogService.getCatalogProfile(it) }
            .let { documentService.getDocumentTypesOfProfile(it.identifier) }
            .map { it.className }

        report.references
            .map { it.document.type }
            .toSet()
            .forEach {
                if (it !in documentTypesOfProfile) {
                    throw ServerException.withReason("DocumentType not known in this profile: $it")
                }
            }
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

    private data class JobInfo(
        val startTime: Date?,
        val profile: String,
        val catalogId: String,
        val importFile: String?,
        val analysis: OptimizedImportAnalysis?,
        val options: ImportOptions?
    )
}