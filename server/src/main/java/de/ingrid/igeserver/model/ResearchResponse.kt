package de.ingrid.igeserver.model

import de.ingrid.igeserver.services.Result

data class ResearchResponse(val totalHits: Int, val hits: List<Result>)
