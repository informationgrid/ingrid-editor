/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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