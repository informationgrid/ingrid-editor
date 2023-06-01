package de.ingrid.igeserver.services.geothesaurus

import de.ingrid.igeserver.api.NotFoundException
import org.springframework.stereotype.Service

@Service
class GeoThesaurusFactory(val thesauri: List<GeoThesaurusService>) {
    fun get(id: String): GeoThesaurusService {
        return thesauri.find { it.id == id } ?: throw NotFoundException.withMissingResource(id, "GeoThesaurus")
    }
}