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
package de.ingrid.igeserver.exceptions

import de.ingrid.igeserver.ServerException
import org.springframework.http.HttpStatus

class IsReferencedException(
    statusCode: HttpStatus,
    errorCode: String,
    errorText: String,
    data: Map<String, Any?>? = null,
    cause: Throwable? = null
) : ServerException(statusCode, errorCode, errorText, data, cause) {

    companion object {
        private const val ERROR_CODE = "IS_REFERENCED_ERROR"
        private const val ERROR_CODE_ADDRESS_UNPUBLISH = "IS_REFERENCED_ERROR_ADDRESS_UNPUBLISH"
        private const val ERROR_TEXT = "The document is referenced and cannot be deleted"
        private const val ERROR_TEXT_ADDRESS = "The address is referenced by published dataset"

        /**
         * Factory method for an arbitrary reason
         */
        fun byUuids(uuids: List<String>): IsReferencedException {
            return IsReferencedException(STATUS_CODE, ERROR_CODE, ERROR_TEXT, mapOf("uuids" to uuids))
        }
        
        fun addressByPublishedDatasets(uuids: List<String>): IsReferencedException {
            return IsReferencedException(STATUS_CODE, ERROR_CODE_ADDRESS_UNPUBLISH, ERROR_TEXT_ADDRESS, mapOf("uuids" to uuids))
        }
    }
}
