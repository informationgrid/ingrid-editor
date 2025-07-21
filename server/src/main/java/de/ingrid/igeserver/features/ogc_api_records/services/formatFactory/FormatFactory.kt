/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.formatFactory

import de.ingrid.igeserver.configuration.ConfigurationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

data class FormatterTypeInfo(
    val id: String,
    val name: String,
    val mimeTypes: List<String>,
    val exportType: String,
)

@Service
class FormatFactory {

    @Autowired
    private lateinit var formatter: List<BodyFormatter>

    fun getFormatter(mimeType: String): BodyFormatter {
        val responsibleFormatter = formatter
            .filter { it.typeInfo.mimeTypes.contains(mimeType) }

        if (responsibleFormatter.isEmpty()) {
            throw ConfigurationException.withReason("No OGC body formatter found for mimeType '$mimeType'")
        } else if (responsibleFormatter.size > 1) {
            val formatterNames = responsibleFormatter.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one OGC body formatter found for mimeType '$mimeType'.")
        }

        return responsibleFormatter[0]
    }
}
