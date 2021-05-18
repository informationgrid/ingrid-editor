package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.services.Result

data class ResearchResponse(val totalHits: Int, val hits: List<Result>)
