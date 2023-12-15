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

import jakarta.xml.bind.annotation.XmlRootElement
import jakarta.xml.bind.annotation.XmlTransient

@XmlRootElement
class ApiResponseMessage(@get:XmlTransient var code: Int, var message: String?) {
    var type: String? = null

    init {
        type = when (code) {
            ERROR -> "error"
            WARNING -> "warning"
            INFO -> "Info"
            OK -> "ok"
            TOO_BUSY -> "too busy"
            else -> "unknown"
        }
    }

    companion object {
        const val ERROR = 1
        const val WARNING = 2
        const val INFO = 3
        const val OK = 4
        const val TOO_BUSY = 5
    }
}