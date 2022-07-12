package de.ingrid.igeserver.utils

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ReferenceHandlerFactory @Autowired constructor(val referenceHandlers: List<ReferenceHandler>) {
    fun get(profile: String): ReferenceHandler? {
        return referenceHandlers.find {it.getProfile() == profile}
    }
}