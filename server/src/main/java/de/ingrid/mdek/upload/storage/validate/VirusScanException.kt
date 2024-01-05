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
