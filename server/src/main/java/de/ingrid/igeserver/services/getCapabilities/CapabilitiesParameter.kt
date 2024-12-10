package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.ResearchService

data class CapabilitiesParameter(
    val codelistHandler: CodelistHandler,
    val researchService: ResearchService,
    val catalogId: String,
)
