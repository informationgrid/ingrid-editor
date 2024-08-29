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
package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

open class IndexException : ServerException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
        super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "INDEXING_ERROR"
        private const val ERROR_CODE_CANCEL = "INDEXING_CANCELED"
        private const val ERROR_CODE_FOLDER_WITH_NO_CHILDREN = "FOLDER_WITH_NO_CHILDREN"
        private const val ERROR_TEXT_MISSING = "Value '\${valueName}' is missing or empty."

        /**
         * Factory method for missing configuration value
         */
        fun wasCancelled(): IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE_CANCEL, "Indexing was cancelled")
        }

        /**
         * Factory method for an arbitrary reason
         */
        fun withReason(reason: String, cause: Throwable? = null): IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE, reason, null, cause)
        }

        fun folderWithNoPublishedDocs(uuid: String): IndexException {
            return IndexException(STATUS_CODE, ERROR_CODE_FOLDER_WITH_NO_CHILDREN, uuid)
        }
    }
}
