package de.ingrid.igeserver.utils

import de.ingrid.igeserver.services.CatalogProfile
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ReferenceHandlerFactory(val referenceHandlers: List<ReferenceHandler>) {
    fun get(profile: CatalogProfile): ReferenceHandler? {
        return referenceHandlers.find {it.getProfile() == profile.identifier || it.getProfile() == profile.parentProfile}
    }
}