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
            return filter.first().id
        } catch (e: NoSuchElementException) {
            throw ConfigurationException.withReason("The profile '$profile' does not support the OGC 'q' parameter. Filtering by keywords is not possible.")
        }
    }
}