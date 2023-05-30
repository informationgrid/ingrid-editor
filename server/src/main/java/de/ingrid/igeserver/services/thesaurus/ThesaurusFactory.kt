package de.ingrid.igeserver.services.thesaurus

import de.ingrid.igeserver.api.NotFoundException
import org.springframework.stereotype.Service

@Service
class ThesaurusFactory (val thesauri: List<ThesaurusService>) {
    
    fun get(id: String): ThesaurusService {
        return thesauri.find { it.id == id } ?: throw NotFoundException.withMissingResource(id, "Thesaurus")
    }
    
}