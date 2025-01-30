package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.tasks.quartz.IgeJob
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobExecutionContext
import org.quartz.PersistJobDataAfterExecution
import org.springframework.stereotype.Component
import java.time.OffsetDateTime

@Component
@PersistJobDataAfterExecution
class UvpArchiveTask : IgeJob() {
    override val log = logger()

    companion object {
        const val JOB_KEY: String = "uvp-archive"
    }

    override fun run(context: JobExecutionContext) {
        log.info("Starting Task: UVP-Archive")
        val type: ArchiveType = ArchiveType.valueOf(context.mergedJobDataMap["type"] as String)
        val date = OffsetDateTime.parse(context.mergedJobDataMap["date"] as String)

        when (type) {
            ArchiveType.HIDE_ALL -> handleHideAll(date)
            ArchiveType.SHOW_ALL -> handleShowAll()
            ArchiveType.SHOW_ONLY_DECISION -> handleShowOnlyDecision(date)
        }
    }

    private fun handleShowOnlyDecision(date: OffsetDateTime) {
        TODO("Not yet implemented")
    }

    private fun handleShowAll() {
        TODO("Not yet implemented")
    }

    private fun handleHideAll(date: OffsetDateTime) {
        TODO("Not yet implemented")
    }
}
