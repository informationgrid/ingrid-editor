package de.ingrid.igeserver.model

import com.fasterxml.jackson.databind.JsonNode

data class Behaviour(val _id: String, val active: Boolean, val data: JsonNode?)