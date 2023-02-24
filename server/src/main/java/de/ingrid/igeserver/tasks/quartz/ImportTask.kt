import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.convertValue
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.messaging.DatasetInfo
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.imports.ImportAnalysis
import de.ingrid.igeserver.imports.ImportMessage
import de.ingrid.igeserver.imports.ImportService
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

@Component
@PersistJobDataAfterExecution
class ImportTask @Autowired constructor(
    val notifier: JobsNotifier,
    val importService: ImportService
) : InterruptableJob {

    private val log = logger()

    var currentThread: Thread? = null

    val notificationType = MessageTarget(NotificationType.IMPORT, "uvp_catalog")

    override fun execute(context: JobExecutionContext) {
        log.info("Starting Task: Import")

        val message = ImportMessage()
        notifier.sendMessage(notificationType, message.apply { this.message = "Started URLChecker" })

        val info = prepareJob(context, message)

        runAsUser()
        val analysis = importService.analyzeFile(info.catalogId, info.importFile)

        finishJob(message, context, analysis)
        log.debug("Task finished: URLChecker for '$info.catalogId'")
    }

    private fun finishJob(
        message: ImportMessage,
        context: JobExecutionContext,
        analysis: List<ImportAnalysis>,
        errors: MutableList<String> = mutableListOf()
    ) {
        notifier.endMessage(notificationType, message.apply {
            this.message = "Finished Import"
            this.analysis = createReport(analysis)
            this.errors = errors
        })

        val persistData: JobDataMap = context.jobDetail?.jobDataMap!!
        persistData["startTime"] = message.startTime
        persistData["endTime"] = message.endTime
        persistData["analysis"] = jacksonObjectMapper().convertValue<JsonNode>(analysis).toString()
        persistData["errors"] = jacksonObjectMapper().writeValueAsString(message.errors)

        currentThread = null
    }

    private fun createReport(analysis: List<ImportAnalysis>): ImportReport {
        return ImportReport(
            "",
            analysis.size,
            analysis.flatMap { it.references.map { it.document.uuid } }.distinct().size,
            analysis.filter { it.exists }
                .map { DatasetInfo(it.document.title ?: "???", it.document.type, it.document.uuid) },
            analysis.flatMap {
                it.references
                    .filter { it.exists }
                    .map { DatasetInfo(it.document.title ?: "???", it.document.type, it.document.uuid) }
            }.distinctBy { it.uuid }
        )
    }

    override fun interrupt() {
        log.info("Task interrupted")
        currentThread?.interrupt()
    }

    private fun prepareJob(context: JobExecutionContext, message: ImportMessage): JobInfo {
        val dataMap: JobDataMap = context.mergedJobDataMap!!

        val profile = dataMap.getString("profile")
        val catalogId: String = dataMap.getString("catalogId")
        val importFile: String = dataMap.getString("importFile")

        currentThread = Thread.currentThread()

        return JobInfo(profile, catalogId, importFile)
    }

    private fun runAsUser() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

    data class JobInfo(val profile: String, val catalogId: String, val importFile: String)

    data class ImportReport(
        val importer: String,
        val numDatasets: Int,
        val numAddresses: Int,
        val existingDatasets: List<DatasetInfo>,
        val existingAddresses: List<DatasetInfo>,
    )

}