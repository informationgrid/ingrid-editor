package de.ingrid.igeserver.tasks

import de.ingrid.codelists.CodeListService
import de.ingrid.codelists.model.CodeList
import jakarta.annotation.PostConstruct
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component

@Profile("codelist-repo")
@Component
class CodelistTask(val codeListService: CodeListService) {
    val log = logger()

    @PostConstruct
    fun onStartup() = codelistTask()

    @Scheduled(cron = "\${cron.codelist.expression}")
    fun codelistTask() {
        log.info("Starting Task: Codelist")
        val lastModifiedTimestamp = codeListService.lastModifiedTimestamp
        val codeLists = codeListService.updateFromServer(lastModifiedTimestamp)
        logResult(codeLists)
    }

    private fun logResult(codeLists: List<CodeList>?) = when {
        codeLists == null -> log.error("Requesting codelist repository failed")
        codeLists.isNotEmpty() -> log.info("Finished Codelist - Task with ${codeLists.size} new codelists")
        else -> log.debug("Finished Codelist")
    }

}