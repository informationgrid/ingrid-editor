package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.node.ArrayNode

data class ResearchResponse(val totalHits: Int, val hits: ArrayNode)
