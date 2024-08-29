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
package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.databind.JsonNode
import org.springframework.stereotype.Component

/**
 * EmbeddedData type used by AuditLogRecord instances
 */
@Component
class AuditLogRecordData(
    val cat: String? = null,
    val action: String? = null,
    val actor: String? = null,
    val time: String? = null,
    val target: String? = null,
    val data: JsonNode? = null,
    val record_type: String? = null,
    val catalogIdentifier: String? = null,
) {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "AuditLog"
    }
}
