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
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.services.CatalogProfile
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

@Service
class OgcApiResearchQueryFactory(
    private val ogcApiSearchFilterList: List<OgcApiResearchQuery>,
    @Qualifier("default") private val defaultFilter: OgcApiResearchQuery,
) {
    fun getQuery(profile: CatalogProfile, ogcFilterParameter: OgcFilterParameter): ResearchQuery {
        try {
            val filter = ogcApiSearchFilterList.filter { ogcApiSearchFilter: OgcApiResearchQuery -> ogcApiSearchFilter.profiles.contains(profile.identifier) }
            return when {
                filter.size > 1 -> throw ConfigurationException.withReason("Record query is not possible. The profile '$profile' has more than one OgcApiResearchQuery.")
                filter.isEmpty() -> defaultFilter.createQuery(ogcFilterParameter)
                else -> filter.first().createQuery(ogcFilterParameter)
            }
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("OGC Record query failed due to an unexpected error in OgcApiResearchQuery. $e")
        }
    }
}
