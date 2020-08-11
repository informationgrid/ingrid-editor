package de.ingrid.igeserver.persistence

import com.fasterxml.jackson.databind.JsonNode

class FindAllResults(var totalHits: Long, var hits: List<JsonNode>) 