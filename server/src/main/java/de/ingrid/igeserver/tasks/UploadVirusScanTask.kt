package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.mail.EmailServiceImpl
import de.ingrid.mdek.upload.Config
import de.ingrid.mdek.upload.storage.validate.Validator
import de.ingrid.mdek.upload.storage.validate.ValidatorFactory
import de.ingrid.mdek.upload.storage.validate.VirusFoundException
import de.ingrid.mdek.upload.storage.validate.VirusScanException
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.mail.MailSendException
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption

@Component
class UploadVirusScanTask @Autowired constructor(
    private var emailService: EmailServiceImpl,
    private val uploadSettings: Config
){
    private var virusScanValidator: Validator? = null
    private var scanDirs: List<String>? = null
    private var quarantineDir: String? = null
    private var report: Report? = null
    private var sendReportEmails = true
    private var emailServiceReport: EmailService = EmailServiceReport()


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

    /**
     * Set the validator factory.
     * @param validatorFactory
     */
    fun setValidatorFactory(validatorFactory: ValidatorFactory?) {
        require(!(validatorFactory == null || !validatorFactory.validatorNames.contains(VIRUSSCAN_VALIDATOR_NAME))) { "The provided validator factory does not contain a validator with name $VIRUSSCAN_VALIDATOR_NAME" }
        virusScanValidator = validatorFactory.getValidator(VIRUSSCAN_VALIDATOR_NAME)
    }

    /**
     * Set the directories to scan.
     * @param scanDirs
     */
    fun setScanDirs(scanDirs: List<String>?) {
        this.scanDirs = scanDirs
    }

    /**
     * Set the directory for storing infected files.
     * @param quarantineDir
     */
    fun setQuarantineDir(quarantineDir: String?) {
        this.quarantineDir = quarantineDir
    }

    /**
     * Enable/disable email reports.
     * @param enabled
     */
    fun setEmailReports(enabled: Boolean) {
        this.sendReportEmails = enabled
    }

    /**
     * Set the email service.
     * Defaults to instance of EmailServiceImpl if not set explicitly.
     * @param emailService
     */
    fun setEmailService(emailService: EmailServiceImpl) {
        this.emailService = emailService
    }

    @Scheduled(cron = "\${upload.virusscan.schedule}")
    fun executeVirusscan() {
        virusScanValidator = uploadSettings.uploadValidatorMap[VIRUSSCAN_VALIDATOR_NAME] ?: return
        setScanDirs(listOf(uploadSettings.uploadDocsDir, uploadSettings.uploadPartsDir))
        setQuarantineDir(uploadSettings.uploadVirusScanQuarantineDir)
        report = Report()
        log(Level.INFO, "Executing UploadVirusScanJob...", null)
        log(Level.INFO, "Directories to scan: " + java.lang.String.join(", ", scanDirs), null)
        val infectedFiles: MutableList<Path> = ArrayList()
        val exceptions: MutableList<Exception> = ArrayList()
        try {
            // scan files
            for (scanDir in scanDirs!!) {
                log(Level.DEBUG, "Scanning directory \"$scanDir\"...", null)
                try {
                    virusScanValidator!!.validate(scanDir, null, 0L, 0L, Paths.get(scanDir), false)
                } catch (vfex: VirusFoundException) {
                    for (file in vfex.infections.keys) {
                        infectedFiles.add(file)
                        // print infection information
                        log(
                            Level.INFO,
                            "Infection found: " + file.toString() + " - " + vfex.infections[file].toString(),
                            null
                        )
                    }
                    // add scan log in case of virus
                    report!!.add(vfex.scanReport)
                } catch (vscanex: VirusScanException) {
                    val scanReport: String = vscanex.scanReport
                    log(Level.WARN, "Error(s) found during the scan: $scanReport", null)
                    exceptions.add(vscanex)
                } catch (ex: Exception) {
                    log(Level.ERROR, "Error scanning directory \"$scanDir\"", ex)
                    exceptions.add(ex)
                }
            }
            log(Level.INFO, "Found " + infectedFiles.size + " infected file(s)", null)

            // cleanup (only if virus are found)
            if (infectedFiles.isNotEmpty()) {
                doCleanup(infectedFiles)
            }
            log(Level.INFO, "Finished UploadVirusScanJob", null)
        } catch (ex: Exception) {
            log(Level.ERROR, "Error while running UploadVirusScanJob", ex)
            log(Level.INFO, "Aborted UploadVirusScanJob", null)
        }
        if (sendReportEmails && (infectedFiles.isNotEmpty() || exceptions.isNotEmpty())) {
            val subject = if (exceptions.isNotEmpty()) EMAIL_ERROR_REPORT_SUBJECT else EMAIL_REPORT_SUBJECT
            try {
                emailServiceReport.sendReport(subject, report!!)
            } catch (ex: MailSendException) {
                log(Level.ERROR, "Error sending report", ex)
            }
        }
    }

    /**
     * Cleanup
     * @param infectedFiles
     */
    private fun doCleanup(infectedFiles: List<Path>) {
        // move infected files into quarantine
        log(Level.INFO, "Moving infected file(s)...", null)
        var movedCount = 0
        for (file in infectedFiles) {
            val targetPath = Paths.get(quarantineDir!!, file.toString())
            log(Level.INFO, "Moving file: \"$file\" to \"$targetPath\"", null)
            try {
                log(Level.INFO, Paths.get(file.toString()).toAbsolutePath().toString(), null )
                Files.createDirectories(targetPath.parent)
                Files.move(file, targetPath, StandardCopyOption.REPLACE_EXISTING)
                movedCount++
            } catch (e: IOException) {
                // log error, but keep the job running
                log(Level.ERROR, "File \"$file\" could not be moved to quarantine", e)
            }
        }
        log(Level.INFO, "Moved $movedCount infected file(s)", null)
    }

    /**
     * Add a message to the log and report
     * @param level
     * @param message
     * @param t
     */
    private fun log(level: Level, message: String, t: Throwable?) {
        log.log(level, message, t)

        // add to report
        if (level.isMoreSpecificThan(Level.INFO)) {
            report!!.add(message)
            if (t != null) {
                report!!.add(t.message)
            }
        }
    }

    companion object {
        private const val EMAIL_REPORT_SUBJECT = "[IGE-NG] Virus Scan Report"
        private const val EMAIL_ERROR_REPORT_SUBJECT = "$EMAIL_REPORT_SUBJECT ERROR"
        private const val VIRUSSCAN_VALIDATOR_NAME = "virusscan"
        private val log = LogManager.getLogger(
            UploadVirusScanTask::class.java
        )
    }
}

