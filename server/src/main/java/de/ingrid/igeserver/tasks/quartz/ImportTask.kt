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
package de.ingrid.igeserver.tasks.quartz

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.api.messaging.JobsNotifier
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.api.messaging.MessageTarget
import de.ingrid.igeserver.api.messaging.NotificationType
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import net.pwall.json.schema.output.BasicErrorEntry
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
class ImportTask(
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
                    val profile = catalogService.getProfileFromCatalog(info.catalogId)
                    importService.analyzeFile(info.catalogId, info.importFile!!, message)
                        .also { checkForValidDocumentsInProfile(profile, it) }
                        .also {
                            profile.additionalImportAnalysis(info.catalogId, it, message)
                        }
                        .also {
                            System.gc()    
                            Files.delete(Path.of(info.importFile)) 
                        }
                }

                Stage.IMPORT -> {
                    message.infos = info.infos
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
            val errorMessage = prepareErrorMessage(ex)
            message.apply {
                this.report = info.analysis; this.endTime = Date(); this.stage = stage.name; this.errors = mutableListOf(errorMessage)
            }.also {
                finishJob(context, it)
                notifier.sendMessage(notificationType, it)
            }
            throw ex
        }

        log.debug("Task finished: Import for '$info.catalogId'")
    }

    @Suppress("UNCHECKED_CAST")
    private fun prepareErrorMessage(ex: Exception): String {
        var message = ex.message ?: ex.toString()
        if (ex is ValidationException) {
            val details = ex.data?.get("error") as List<BasicErrorEntry>?
            message += ": " + details
                ?.filter { it.error != "A subschema had errors" }
                ?.joinToString(", ") { "${it.instanceLocation}: ${it.error}" }
        }
        return message
    }

    private fun checkForValidDocumentsInProfile(profile: CatalogProfile, report: OptimizedImportAnalysis) {
        val documentTypesOfProfile = profile
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
            put("infos", null)
        }
    }

    private fun prepareJob(context: JobExecutionContext): JobInfo {
        context.mergedJobDataMap!!.run {
            val startTime: Date? = get("startTime") as Date?
            val profile = getString("profile")
            val catalogId: String = getString("catalogId")
            val importFile: String? = getString("importFile")
            val infos: MutableList<String> = getString("infos")?.let { jacksonObjectMapper().readValue(it) } ?: mutableListOf()
            val report: OptimizedImportAnalysis? = getString("report")?.let { jacksonObjectMapper().readValue(it) }
            val options: ImportOptions? = getString("options")?.let { jacksonObjectMapper().readValue(it) }

            return JobInfo(startTime, profile, catalogId, importFile, report, options, infos)
        }
    }

    private data class JobInfo(
        val startTime: Date?,
        val profile: String,
        val catalogId: String,
        val importFile: String?,
        val analysis: OptimizedImportAnalysis?,
        val options: ImportOptions?,
        val infos: MutableList<String>
    )
}