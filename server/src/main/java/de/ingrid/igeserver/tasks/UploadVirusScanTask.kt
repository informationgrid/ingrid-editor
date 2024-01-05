/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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

import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.mdek.upload.Config
import de.ingrid.mdek.upload.storage.validate.VirusFoundException
import de.ingrid.mdek.upload.storage.validate.VirusScanException
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.kotlin.logger
import org.springframework.mail.MailSendException
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@Component
class UploadVirusScanTask(
    private var emailService: EmailServiceImpl,
    private val uploadSettings: Config
){
    val log = logger()
    val emailReportSubject = "[IGE-NG] Virus Scan Report"
    val emailErrorReportSubject = "[IGE-NG] Virus Scan ERROR"
    val virusscanValidatorName = "virusscan"

    @Scheduled(cron = "\${upload.virusscan.schedule}")
    fun executeVirusscan() {
        val virusScanValidator = uploadSettings.uploadValidatorMap[virusscanValidatorName] ?: return
        val scanDirs = listOf(uploadSettings.uploadDocsDir, uploadSettings.uploadPartsDir)
        val report = Report()
        val emailServiceReport: EmailService = EmailServiceReport()
        val sendReportEmails = true

        log(Level.INFO, "Executing UploadVirusScanJob...", report, null)
        log(Level.INFO, "Directories to scan: " + java.lang.String.join(", ", scanDirs), report, null)
        val infectedFiles = mutableListOf<Path>()
        val exceptions = mutableListOf<Exception>()
        try {
            // scan files
            for (scanDir in scanDirs) {
                log(Level.DEBUG, "Scanning directory '$scanDir'...", report, null)
                try {
                    virusScanValidator.validate(scanDir, null, 0L, 0L, Paths.get(scanDir), false)
                } catch (vfex: VirusFoundException) {
                    for (file in vfex.infections.keys) {
                        infectedFiles.add(file)
                        // print infection information
                        log(
                            Level.INFO,
                            "Infection found: " + file.toString() + " - " + vfex.infections[file].toString(),
                            report,
                            null
                        )
                    }
                    // add scan log in case of virus
                    report.add(vfex.scanReport)
                } catch (vscanex: VirusScanException) {
                    val scanReport: String = vscanex.scanReport
                    log(Level.WARN, "Error(s) found during the scan: $scanReport", report, null)
                    exceptions.add(vscanex)
                } catch (ex: Exception) {
                    log(Level.ERROR, "Error scanning directory '$scanDir'", report, ex)
                    exceptions.add(ex)
                }
            }
            log(Level.INFO, "Found " + infectedFiles.size + " infected file(s)", report, null)

            // cleanup (only if virus are found)
            if (infectedFiles.isNotEmpty()) {
                doCleanup(infectedFiles, report)
            }
            log(Level.INFO, "Finished UploadVirusScanJob", report, null)
        } catch (ex: Exception) {
            log(Level.ERROR, "Error while running UploadVirusScanJob", report, ex)
            log(Level.INFO, "Aborted UploadVirusScanJob", report, null)
        }
        if (sendReportEmails && (infectedFiles.isNotEmpty() || exceptions.isNotEmpty())) {
            val subject = if (exceptions.isNotEmpty()) emailErrorReportSubject else emailReportSubject
            try {
                emailServiceReport.sendReport(subject, report)
            } catch (ex: MailSendException) {
                log(Level.ERROR, "Error sending report", report, ex)
            }
        }
    }

    private fun doCleanup(infectedFiles: List<Path>, report: Report) {
        // move infected files into quarantine
        log(Level.INFO, "Moving infected file(s)...", report, null)
        //        setQuarantineDir(uploadSettings.uploadVirusScanQuarantineDir)
        val quarantineDir = uploadSettings.uploadVirusScanQuarantineDir
        var movedCount = 0
        for (file in infectedFiles) {
            val targetPath = Paths.get(quarantineDir!!, file.toString())
            log(Level.INFO, "Moving file: '$file' to '$targetPath'", report, null)
            try {
                log(Level.INFO, Paths.get(file.toString()).toAbsolutePath().toString(), report, null )
                Files.createDirectories(targetPath.parent)
                Files.move(file, targetPath, StandardCopyOption.REPLACE_EXISTING)
                movedCount++
            } catch (e: IOException) {
                // log error, but keep the job running
                log(Level.ERROR, "File '$file' could not be moved to quarantine", report, e)
            }
        }
        log(Level.INFO, "Moved $movedCount infected file(s)", report, null)
    }

    /**
     * Add a message to the log and report
     */
    private fun log(level: Level, message: String, report: Report, t: Throwable?) {
        log.log(level, message, t)

        // add to report
        if (level.isMoreSpecificThan(Level.INFO)) {
            report.add(message)
            if (t != null) {
                report.add(t.message)
            }
        }
    }

    class Report {
        private val content = StringBuilder()
        fun add(entry: String?) {
            content.append(entry).append(System.lineSeparator())
        }

        fun getContent(): String {
            return content.toString()
        }
    }

    /**
     * Encapsulates email functions for better testability
     */
    interface EmailService {
        fun sendReport(subject: String, report: Report)
    }

    private inner class EmailServiceReport : EmailService {
        override fun sendReport(subject: String, report: Report) {
            emailService.sendEmail(uploadSettings.uploadVirusScanMailReceiver, subject, report.getContent())
        }
    }
}
