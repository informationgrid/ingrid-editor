/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.ogc

import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.model.KeywordFilter
import de.ingrid.igeserver.services.CatalogProfile
import org.springframework.stereotype.Service


@Service
class KeywordFilterSelector(private val keywordFilterList: List<KeywordFilter>)  {
    fun getKeywordFilter(profile: CatalogProfile): String {
        try {
            val filter = keywordFilterList.filter { keywordFilter: KeywordFilter -> keywordFilter.profiles.contains(profile.identifier) }
            if (filter.size > 1 ) throw ConfigurationException.withReason("Filtering by keywords is not possible. The profile '$profile' has more than one KeywordFilter.")
            return filter.first().id
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("Filtering by keywords is not possible. The profile '$profile' does not support the OGC 'q' parameter.")
        }
    }
}