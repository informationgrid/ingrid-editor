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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import org.springframework.http.HttpStatus

open class InvalidParameterException: ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
            super(statusCode, errorCode, errorText, data, cause)

    companion object {
        private const val ERROR_CODE = "INVALID_PARAMETER"
        private const val ERROR_TEXT_INVALID = "One or more request parameters are missing or contain invalid values: \${parameterNames}."

        /**
         * Factory method for invalid parameters
         */
        fun withInvalidParameters(vararg parameterNames: String, cause: Throwable? = null) : InvalidParameterException {
            return InvalidParameterException(STATUS_CODE, ERROR_CODE, ERROR_TEXT_INVALID, mapOf("parameterNames" to parameterNames), cause)
        }
    }
}