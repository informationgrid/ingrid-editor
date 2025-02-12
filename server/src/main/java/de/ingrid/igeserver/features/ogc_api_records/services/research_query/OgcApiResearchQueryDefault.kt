/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.research_query

import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.model.BoolFilter
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Component

@Component
@Qualifier("default")
class OgcApiResearchQueryDefault : OgcApiResearchQuery() {
    override val profiles = listOf("")

    override lateinit var ogcParameter: OgcFilterParameter

    override fun profileSpecificClauses(): MutableList<BoolFilter>? {
        if (ogcParameter.qParameter != null) {
            throw ConfigurationException.withReason("Request parameter 'q' is not yet supported for current profile. Please remove the parameter.")
        }
        return null
    }
}
