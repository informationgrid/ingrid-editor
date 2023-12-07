package de.ingrid.mdek.upload.storage.validate

import de.ingrid.mdek.upload.ValidationException

/**
 * when an error -that do not throw an exception- is found during a scan
 * record all logs output of the scan
 */
open class VirusScanException(message: String, file: String, scanReport: String) :
    ValidationException(message, file, STATUS_CODE) {
    init {
        data[SCAN_EXCEPTION_KEY] = scanReport
    }

    val scanReport: String
        /**
         * Get the whole log returned by the virus scan
         * @return String
         */
        get() = data[SCAN_EXCEPTION_KEY] as String

    companion object {
        private const val STATUS_CODE = 419
        private const val serialVersionUID = 1L
        private const val SCAN_EXCEPTION_KEY = "scanReport"
    }
}
