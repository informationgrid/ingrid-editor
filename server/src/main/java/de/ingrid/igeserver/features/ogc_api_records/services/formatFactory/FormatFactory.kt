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

data class FormaterTypeInfo(
    val id: String,
    val name: String,
    val mimeType: String,
    val exportType: String,
)

@Service
class FormatFactory {

    @Autowired
    private lateinit var formater: List<BodyFormater>

    fun getFormater(mimeType: String, exportType: String): BodyFormater {
        val responsibleFormater = formater
            .filter { it.typeInfo.mimeType === mimeType && it.typeInfo.exportType == exportType }

        if (responsibleFormater.isEmpty()) {
            throw ConfigurationException.withReason("No OGC body formater found for mimeType '$mimeType' and exportType '$exportType'.")
        } else if (responsibleFormater.size > 1) {
            val formaterNames = responsibleFormater.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one OGC body formater found for mimeType '$mimeType' and exportType '$exportType': '$formaterNames'.")
        }

        return responsibleFormater[0]
    }
}
